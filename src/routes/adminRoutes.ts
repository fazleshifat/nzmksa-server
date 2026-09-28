import express from "express";

import {
    getAllAdmins,
    getAdminById,
} from "../controllers/adminController";

const router = express.Router();

router.get("/", getAllAdmins);

router.get("/:id", getAdminById);

export default router;