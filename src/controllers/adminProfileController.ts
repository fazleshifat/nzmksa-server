import { Response } from "express";
import bcrypt from "bcryptjs";
import { Admin } from "../models/Admin";
import { AdminRequest } from "../middleware/adminAuthMiddleware";

/* ============================================================
   GET MY ADMIN PROFILE
   GET /api/admin/profile
============================================================ */

export const getMyProfile = async (
    req: AdminRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.adminId) {
            res.status(401).json({
                message: "Admin authentication required.",
            });
            return;
        }

        const admin = await Admin.findById(
            req.adminId
        )
            .select(
                "_id name email role active createdAt updatedAt"
            )
            .lean();

        if (!admin) {
            res.status(404).json({
                message: "Admin not found.",
            });
            return;
        }

        res.status(200).json({
            admin,
        });
    } catch (error) {
        console.error(
            "Failed to fetch admin profile:",
            error
        );

        res.status(500).json({
            message: "Failed to load admin profile.",
        });
    }
};

/* ============================================================
   UPDATE MY ADMIN PROFILE
   PATCH /api/admin/profile
============================================================ */

export const updateMyProfile = async (
    req: AdminRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.adminId) {
            res.status(401).json({
                message: "Admin authentication required.",
            });
            return;
        }

        const {
            name,
            currentPassword,
            newPassword,
        } = req.body;

        /* ====================================================
           LOAD ADMIN WITH PASSWORD
        ==================================================== */

        const admin = await Admin.findById(
            req.adminId
        ).select("+password");

        if (!admin) {
            res.status(404).json({
                message: "Admin not found.",
            });
            return;
        }

        /* ====================================================
           UPDATE NAME
        ==================================================== */

        if (name !== undefined) {
            const trimmedName = String(name).trim();

            if (!trimmedName) {
                res.status(400).json({
                    message: "Name cannot be empty.",
                });
                return;
            }

            admin.name = trimmedName;
        }

        /* ====================================================
           UPDATE PASSWORD
        ==================================================== */

        if (newPassword !== undefined) {
            if (!currentPassword) {
                res.status(400).json({
                    message:
                        "Current password is required to change password.",
                });
                return;
            }

            const password = String(newPassword);

            if (password.length < 8) {
                res.status(400).json({
                    message:
                        "New password must be at least 8 characters long.",
                });
                return;
            }

            const passwordMatch =
                await bcrypt.compare(
                    String(currentPassword),
                    admin.password
                );

            if (!passwordMatch) {
                res.status(400).json({
                    message:
                        "Current password is incorrect.",
                });
                return;
            }

            admin.password =
                await bcrypt.hash(password, 12);
        }

        await admin.save();

        res.status(200).json({
            message:
                "Admin profile updated successfully.",
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                active: admin.active,
                createdAt: admin.createdAt,
                updatedAt: admin.updatedAt,
            },
        });
    } catch (error) {
        console.error(
            "Failed to update admin profile:",
            error
        );

        res.status(500).json({
            message: "Failed to update admin profile.",
        });
    }
};