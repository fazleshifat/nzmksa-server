import { Router } from "express";

import {
  uploadEmployeeImage,
} from "../controllers/uploadController";

import {
  protect,
  adminProtect,
} from "../middleware/auth";

import { upload } from "../middleware/upload";

const router = Router();

/*
 * Existing employee self-upload
 */
router.post(
  "/employee-image",
  protect,
  upload.single("image"),
  uploadEmployeeImage
);

/*
 * Admin upload for any user
 */
router.post(
  "/admin/user/:id/image",
  protect,
  adminProtect,
  upload.single("image"),
  uploadEmployeeImage
);

export default router;