import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AdminTokenPayload {
    userId: string;
    role: "admin" | "superadmin";
}

export interface AdminRequest extends Request {
    adminId?: string;
    adminRole?: "admin" | "superadmin";
}

export default function adminAuthMiddleware(
    req: AdminRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const authorization = req.headers.authorization;

        if (!authorization) {
            return res.status(401).json({
                message: "Authentication required.",
            });
        }

        if (!authorization.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Invalid authorization format.",
            });
        }

        const token = authorization.substring(7);

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as AdminTokenPayload;

        if (!decoded.userId) {
            return res.status(401).json({
                message: "Invalid admin token.",
            });
        }

        if (
            decoded.role !== "admin" &&
            decoded.role !== "superadmin"
        ) {
            return res.status(403).json({
                message: "Admin access required.",
            });
        }

        req.adminId = decoded.userId;
        req.adminRole = decoded.role;

        next();
    } catch (error) {
        console.error(
            "Admin authentication failed:",
            error
        );

        return res.status(401).json({
            message: "Invalid or expired admin session.",
        });
    }
}