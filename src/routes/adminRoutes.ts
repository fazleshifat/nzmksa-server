import express from "express";

import {
    getAllAdmins,
    getAdminById,
} from "../controllers/adminController";

import {
    deleteOwnPasskey,
    deleteUserPasskey,
} from "../controllers/adminPasskeyController";

import { protect } from "../middleware/auth";

const router = express.Router();

/* ============================================================
   PASSKEY MANAGEMENT
============================================================ */

/*
 * Delete currently logged-in Admin/Super Admin passkeys
 *
 * DELETE /api/admin/all-admins/passkey
 */
router.delete(
    "/passkey",
    protect,
    deleteOwnPasskey
);

/*
 * Delete ONE specific passkey from another account
 *
 * Employee:
 * DELETE /api/admin/all-admins/users/:id/passkey/:credentialId?accountType=employee
 *
 * Admin:
 * DELETE /api/admin/all-admins/users/:id/passkey/:credentialId?accountType=admin
 */
router.delete(
    "/users/:id/passkey/:credentialId",
    protect,
    deleteUserPasskey
);

/* ============================================================
   ADMIN LIST
============================================================ */

router.get("/", getAllAdmins);

router.get("/:id", getAdminById);

export default router;