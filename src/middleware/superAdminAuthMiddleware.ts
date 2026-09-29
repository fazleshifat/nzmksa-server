import { Response, NextFunction } from "express";
import { AdminRequest } from "./adminAuthMiddleware";

export default function superAdminAuthMiddleware(
    req: AdminRequest,
    res: Response,
    next: NextFunction
) {
    if (req.adminRole !== "superadmin") {
        return res.status(403).json({
            message: "Super admin access required.",
        });
    }

    next();
}