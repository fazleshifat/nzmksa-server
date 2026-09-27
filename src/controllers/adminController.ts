import { Request, Response } from "express";
import { Admin } from "../models/Admin";

export const getAllAdmins = async (
    _req: Request,
    res: Response
) => {
    try {
        const admins = await Admin.find({})
            .select("_id name email active createdAt")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            admins,
            total: admins.length,
        });
    } catch (error) {
        console.error("Failed to fetch administrators:", error);

        return res.status(500).json({
            message: "Failed to load administrators",
        });
    }
};