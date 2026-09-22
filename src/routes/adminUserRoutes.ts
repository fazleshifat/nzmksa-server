import { Router } from "express";

import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
} from "../controllers/adminUserController";

import {
  protect,
  adminProtect,
} from "../middleware/auth";

import { upload } from "../middleware/upload";

const router = Router();

// All routes below require admin authentication
router.use(protect);
router.use(adminProtect);

// Get all users
router.get("/", getAllUsers);

// Get one user
router.get("/:id", getUserById);

// Create user
router.post("/", createUser);

// Update user
router.patch("/:id", updateUser);

// Upload avatar / iqama for selected user
router.post(
  "/:id/image",
  upload.single("image"),
  uploadUserImage
);

// Delete user
router.delete("/:id", deleteUser);

export default router;