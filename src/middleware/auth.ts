import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth";
import { verifyToken } from "../utils/token";
import { Session } from "../models/Session";

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const token = header.split(" ")[1];

    if (!token) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const decoded = verifyToken(token);

    /*
     * Check whether the JWT has a session ID.
     */
    if (!decoded.sessionId) {
      res.status(401).json({
        message: "Invalid session",
      });
      return;
    }

    /*
     * Find the session in MongoDB.
     */
    const session = await Session.findById(
      decoded.sessionId
    );

    if (!session) {
      res.status(401).json({
        message: "Session not found",
      });
      return;
    }

    /*
     * Session was forcefully logged out
     * or revoked.
     */
    if (session.revoked) {
      res.status(401).json({
        message: "Your session has been revoked",
      });
      return;
    }

    /*
     * Session was normally logged out.
     */
    if (session.loggedOutAt) {
      res.status(401).json({
        message: "Your session has been logged out",
      });
      return;
    }

    /*
     * Session has expired.
     */
    if (
      new Date(session.expiresAt).getTime() <=
      Date.now()
    ) {
      res.status(401).json({
        message: "Your session has expired",
      });
      return;
    }

    /*
     * Update last activity time.
     */
    session.lastActiveAt = new Date();

    await session.save();

    /*
     * Store authenticated user information.
     */
    req.user = decoded;

    next();
  } catch (error) {
    console.error(
      "Authentication failed:",
      error
    );

    res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export const adminProtect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  if (
    req.user.role !== "admin" &&
    req.user.role !== "superadmin"
  ) {
    res.status(403).json({
      message: "Admin access required",
    });
    return;
  }

  next();
};