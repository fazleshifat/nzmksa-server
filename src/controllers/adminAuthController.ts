import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Admin } from "../models/Admin";
import { signToken } from "../utils/token";

export const adminLogin = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                message: "Email and password are required",
            });
            return;
        }

        const admin = await Admin.findOne({
            email: String(email).trim().toLowerCase(),
        }).select("+password");

        if (!admin || !admin.active) {
            res.status(401).json({
                message: "Invalid credentials",
            });
            return;
        }

        const validPassword = await bcrypt.compare(
            password,
            admin.password
        );

        if (!validPassword) {
            res.status(401).json({
                message: "Invalid credentials",
            });
            return;
        }

        const token = signToken({
            userId: admin._id.toString(),
            role: "admin",
        });

        res.json({
            message: "Admin login successful",
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Admin login failed",
        });
    }
};