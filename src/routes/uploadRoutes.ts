import { Router } from "express";
import { uploadEmployeeImage } from "../controllers/uploadController";
import { protect } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

router.post(
  "/employee-image",
  protect,
  upload.single("image"),
  uploadEmployeeImage
);

export default router;