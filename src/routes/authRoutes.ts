import { Router } from "express";

import {
  login,
  me,
  logout,
} from "../controllers/authController";

import {
  registerPasskeyOptions,
  registerPasskeyVerify,
  loginPasskeyOptions,
  loginPasskeyVerify,
} from "../controllers/passkeyController";

import { protect } from "../middleware/auth";

const router = Router();

router.post("/login", login);

router.get("/me", protect, me);

router.post("/logout", protect, logout);

/* ============================================================
   PASSKEY ROUTES
============================================================ */

// Employee must already be logged in to register a passkey
router.post(
  "/passkey/register/options",
  protect,
  registerPasskeyOptions
);

router.post(
  "/passkey/register/verify",
  protect,
  registerPasskeyVerify
);

// Public routes used during passkey login
router.post(
  "/passkey/login/options",
  loginPasskeyOptions
);

router.post(
  "/passkey/login/verify",
  loginPasskeyVerify
);

export default router;