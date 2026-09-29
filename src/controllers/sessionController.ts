import { Request, Response } from "express";
import mongoose from "mongoose";
import { Session } from "../models/Session";

/*
 * GET ALL SESSIONS
 */
export const getAllSessions = async (
    _req: Request,
    res: Response
): Promise<void> => {
    try {
        const sessions = await Session.find({})
            .sort({ createdAt: -1 })
            .lean();

        const now = new Date();

        const formattedSessions = sessions.map((session) => {
            const isRevoked = session.revoked === true;

            const isLoggedOut =
                Boolean(session.loggedOutAt) && !isRevoked;

            const isExpired =
                new Date(session.expiresAt) <= now &&
                !session.loggedOutAt &&
                !isRevoked;

            const isActive =
                !isRevoked &&
                !session.loggedOutAt &&
                !isExpired;

            let status:
                | "active"
                | "logged_out"
                | "expired"
                | "revoked";

            if (isRevoked) {
                status = "revoked";
            } else if (session.loggedOutAt) {
                status = "logged_out";
            } else if (isExpired) {
                status = "expired";
            } else {
                status = "active";
            }

            const startTime =
                new Date(session.createdAt).getTime();

            let endTime: number;

            if (session.loggedOutAt) {
                endTime =
                    new Date(session.loggedOutAt).getTime();
            } else if (isExpired) {
                endTime =
                    new Date(session.expiresAt).getTime();
            } else {
                endTime = now.getTime();
            }

            const duration = Math.max(
                0,
                Math.floor((endTime - startTime) / 1000)
            );

            return {
                ...session,

                status,

                isActive,
                isLoggedOut,
                isExpired,
                isRevoked,

                duration,
            };
        });

        const total = formattedSessions.length;

        const active = formattedSessions.filter(
            (session) => session.isActive
        ).length;

        const loggedOut = formattedSessions.filter(
            (session) => session.isLoggedOut
        ).length;

        const expired = formattedSessions.filter(
            (session) => session.isExpired
        ).length;

        const revoked = formattedSessions.filter(
            (session) => session.isRevoked
        ).length;

        res.status(200).json({
            sessions: formattedSessions,

            stats: {
                total,
                active,
                loggedOut,
                expired,
                revoked,
            },
        });
    } catch (error) {
        console.error(
            "Failed to fetch sessions:",
            error
        );

        res.status(500).json({
            message: "Failed to load sessions",
        });
    }
};

/*
 * FORCE LOGOUT
 */
export const revokeSession = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        if (Array.isArray(id)) {
            res.status(400).json({
                message: "Invalid session ID",
            });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                message: "Invalid session ID",
            });
            return;
        }

        const session = await Session.findById(id);

        if (!session) {
            res.status(404).json({
                message: "Session not found",
            });
            return;
        }

        if (session.loggedOutAt) {
            res.status(400).json({
                message: "Session is already logged out",
            });
            return;
        }

        if (session.revoked) {
            res.status(400).json({
                message: "Session is already revoked",
            });
            return;
        }

        session.revoked = true;
        session.loggedOutAt = new Date();

        await session.save();

        res.status(200).json({
            message: "Session forcefully logged out",
            session,
        });
    } catch (error) {
        console.error(
            "Failed to revoke session:",
            error
        );

        res.status(500).json({
            message: "Failed to logout session",
        });
    }
};

/*
 * DELETE ONE SESSION
 */
export const deleteSession = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        if (Array.isArray(id)) {
            res.status(400).json({
                message: "Invalid session ID",
            });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                message: "Invalid session ID",
            });
            return;
        }

        const session = await Session.findById(id);

        if (!session) {
            res.status(404).json({
                message: "Session not found",
            });
            return;
        }

        const isActive =
            !session.revoked &&
            !session.loggedOutAt &&
            new Date(session.expiresAt) > new Date();

        if (isActive) {
            res.status(400).json({
                message:
                    "Active sessions must be forcefully logged out before deletion",
            });
            return;
        }

        await Session.findByIdAndDelete(id);

        res.status(200).json({
            message: "Session deleted successfully",
        });
    } catch (error) {
        console.error(
            "Failed to delete session:",
            error
        );

        res.status(500).json({
            message: "Failed to delete session",
        });
    }
};

/*
 * CLEANUP OLD INACTIVE SESSIONS
 */
export const cleanupSessions = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const days = Number(req.query.days || 30);

        if (
            !Number.isFinite(days) ||
            days < 1
        ) {
            res.status(400).json({
                message:
                    "Days must be a valid number greater than 0",
            });
            return;
        }

        const cutoffDate = new Date(
            Date.now() -
            days * 24 * 60 * 60 * 1000
        );

        const result =
            await Session.deleteMany({
                createdAt: {
                    $lt: cutoffDate,
                },

                $or: [
                    {
                        loggedOutAt: {
                            $exists: true,
                            $ne: null,
                        },
                    },
                    {
                        revoked: true,
                    },
                    {
                        expiresAt: {
                            $lte: new Date(),
                        },
                    },
                ],
            });

        res.status(200).json({
            message:
                "Old inactive sessions cleaned successfully",

            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error(
            "Failed to cleanup sessions:",
            error
        );

        res.status(500).json({
            message:
                "Failed to cleanup old sessions",
        });
    }
};