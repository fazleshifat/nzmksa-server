import { Router } from "express";
import { getMyProfile, listEmployees } from "../controllers/employeeController";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/me", protect, getMyProfile);
router.get("/", protect, listEmployees);

export default router;