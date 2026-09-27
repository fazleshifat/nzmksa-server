import express from "express";
import { getAllAdmins } from "../controllers/adminController";

const router = express.Router();

router.get("/", getAllAdmins);

export default router;