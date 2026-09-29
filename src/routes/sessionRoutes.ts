import { Router } from "express";

import adminAuthMiddleware from "../middleware/adminAuthMiddleware";
import superAdminAuthMiddleware from "../middleware/superAdminAuthMiddleware";

import {
    getAllSessions,
    revokeSession,
    deleteSession,
    cleanupSessions,
} from "../controllers/sessionController";

const router = Router();

/*
 * CLEANUP
 *
 * Must come before /:id
 */
router.delete(
    "/cleanup",
    adminAuthMiddleware,
    superAdminAuthMiddleware,
    cleanupSessions
);

/*
 * GET ALL SESSIONS
 */
router.get(
    "/",
    adminAuthMiddleware,
    superAdminAuthMiddleware,
    getAllSessions
);

/*
 * FORCE LOGOUT
 */
router.patch(
    "/:id/revoke",
    adminAuthMiddleware,
    superAdminAuthMiddleware,
    revokeSession
);

/*
 * DELETE SESSION
 */
router.delete(
    "/:id",
    adminAuthMiddleware,
    superAdminAuthMiddleware,
    deleteSession
);

export default router;