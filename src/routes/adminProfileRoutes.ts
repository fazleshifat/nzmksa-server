import express from "express";

import {
    getMyProfile,
    updateMyProfile,
} from "../controllers/adminProfileController";

import adminAuthMiddleware from "../middleware/adminAuthMiddleware";

const router = express.Router();

/*
 * GET CURRENT ADMIN PROFILE
 */
router.get(
    "/",
    adminAuthMiddleware,
    getMyProfile
);

/*
 * UPDATE CURRENT ADMIN PROFILE
 */
router.patch(
    "/",
    adminAuthMiddleware,
    updateMyProfile
);

export default router;