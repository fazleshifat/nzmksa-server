import { Request, Response } from "express";
import { Admin } from "../models/Admin";

export const getAllAdmins = async (
    _req: Request,
    res: Response
) => {
    try {
        const admins = await Admin.find({
            role: "admin",
        })
            .select("_id name email active createdAt")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            admins,
            total: admins.length,
        });
    } catch (error) {
        console.error(
            "Failed to fetch administrators:",
            error
        );

        return res.status(500).json({
            message: "Failed to load administrators",
        });
    }
};

/* ============================================================
   GET ADMIN BY ID
============================================================ */

export const getAdminById = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        const admin = await Admin.findOne({
            _id: id,
            role: "admin",
        })
            .select(
                "_id name email active createdAt updatedAt"
            )
            .lean();

        if (!admin) {
            return res.status(404).json({
                message: "Administrator not found",
            });
        }

        return res.status(200).json({
            admin,
        });
    } catch (error) {
        console.error(
            "Failed to fetch administrator:",
            error
        );

        return res.status(500).json({
            message: "Failed to load administrator",
        });
    }
};