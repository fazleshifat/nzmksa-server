import { Request, Response } from "express";

import { Admin } from "../models/Admin";
import { Employee } from "../models/Employee";

interface PasskeyCredential {
    credentialId: string;
    publicKey?: unknown;
    counter?: number;
    transports?: string[];
    deviceType?: string;
    backedUp?: boolean;
}

/* ============================================================
   DELETE OWN PASSKEY
   Admin / Super Admin can delete their own passkey
============================================================ */

export const deleteOwnPasskey = async (
    req: Request,
    res: Response
) => {
    try {
        const requester = (req as any).user;

        if (
            !requester?.userId ||
            !requester?.role
        ) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        if (
            requester.role !== "admin" &&
            requester.role !== "superadmin"
        ) {
            return res.status(403).json({
                message:
                    "Only admins can delete passkeys",
            });
        }

        const admin = await Admin.findById(
            requester.userId
        );

        if (!admin) {
            return res.status(404).json({
                message: "Administrator not found",
            });
        }

        admin.passkeys = [];

        await admin.save();

        return res.status(200).json({
            message:
                "Your passkey has been deleted successfully",
            verified: true,
        });
    } catch (error) {
        console.error(
            "DELETE OWN PASSKEY ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to delete passkey",
        });
    }
};

/* ============================================================
   DELETE USER PASSKEY

   ADMIN:
   - Employee       ✅
   - Another Admin  ❌
   - Super Admin    ❌

   SUPER ADMIN:
   - Employee       ✅
   - Admin          ✅
   - Super Admin    ✅
============================================================ */

export const deleteUserPasskey = async (
    req: Request,
    res: Response
) => {
    try {
        const requester = (req as any).user;

        if (
            !requester?.userId ||
            !requester?.role
        ) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        if (
            requester.role !== "admin" &&
            requester.role !== "superadmin"
        ) {
            return res.status(403).json({
                message:
                    "Only admins can delete passkeys",
            });
        }

        const { id, credentialId } = req.params;
        const { accountType } = req.query;

        if (!credentialId) {
            return res.status(400).json({
                message:
                    "credentialId is required",
            });
        }

        if (
            accountType !== "employee" &&
            accountType !== "admin"
        ) {
            return res.status(400).json({
                message:
                    "accountType must be employee or admin",
            });
        }

        /* ====================================================
           EMPLOYEE PASSKEY
        ==================================================== */

        if (accountType === "employee") {
            const employee =
                await Employee.findById(id);

            if (!employee) {
                return res.status(404).json({
                    message:
                        "Employee not found",
                });
            }

            const existingPasskeys =
                Array.isArray(employee.passkeys)
                    ? (employee.passkeys as unknown as PasskeyCredential[])
                    : [];

            const passkeyExists =
                existingPasskeys.some(
                    (passkey: PasskeyCredential) =>
                        passkey.credentialId ===
                        credentialId
                );

            if (!passkeyExists) {
                return res.status(404).json({
                    message:
                        "Passkey not found",
                });
            }

            employee.passkeys =
                existingPasskeys.filter(
                    (passkey: PasskeyCredential) =>
                        passkey.credentialId !==
                        credentialId
                ) as typeof employee.passkeys;

            await employee.save();

            return res.status(200).json({
                message:
                    "Employee passkey deleted successfully",
                verified: true,
            });
        }

        /* ====================================================
           ADMIN PASSKEY
        ==================================================== */

        if (accountType === "admin") {
            /*
             * Normal Admin cannot delete
             * another Admin or Super Admin.
             */

            if (
                requester.role !==
                "superadmin"
            ) {
                return res.status(403).json({
                    message:
                        "Admins cannot delete another administrator's passkey",
                });
            }

            const admin =
                await Admin.findById(id);

            if (!admin) {
                return res.status(404).json({
                    message:
                        "Administrator not found",
                });
            }

            const existingPasskeys =
                Array.isArray(admin.passkeys)
                    ? (admin.passkeys as unknown as PasskeyCredential[])
                    : [];

            const passkeyExists =
                existingPasskeys.some(
                    (passkey: PasskeyCredential) =>
                        passkey.credentialId ===
                        credentialId
                );

            if (!passkeyExists) {
                return res.status(404).json({
                    message:
                        "Passkey not found",
                });
            }

            admin.passkeys =
                existingPasskeys.filter(
                    (passkey: PasskeyCredential) =>
                        passkey.credentialId !==
                        credentialId
                ) as typeof admin.passkeys;

            await admin.save();

            return res.status(200).json({
                message:
                    "Administrator passkey deleted successfully",
                verified: true,
            });
        }

        return res.status(400).json({
            message:
                "Invalid account type",
        });
    } catch (error) {
        console.error(
            "DELETE USER PASSKEY ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to delete passkey",
        });
    }
};