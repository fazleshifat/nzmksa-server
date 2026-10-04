import express from "express";

import {
    login,
    me,
} from "../controllers/authController";

import {
    registerPasskeyOptions,
    registerPasskeyVerify,
    loginPasskeyOptions,
    loginPasskeyVerify,
    getPasskeyStatus,
} from "../controllers/passkeyController";

import { protect } from "../middleware/auth";

const router = express.Router();

// ======================================================
// NORMAL AUTH
// ======================================================

router.post("/login", login);

router.get("/me", protect, me);


// ======================================================
// PASSKEY REGISTRATION
// ======================================================

// Get WebAuthn registration options
router.post(
    "/passkey/register/options",
    protect,
    registerPasskeyOptions
);

// Verify and save new passkey
router.post(
    "/passkey/register/verify",
    protect,
    registerPasskeyVerify
);


// ======================================================
// PASSKEY LOGIN
// ======================================================

// Get WebAuthn authentication options
router.post(
    "/passkey/login/options",
    loginPasskeyOptions
);

// Verify passkey login
router.post(
    "/passkey/login/verify",
    loginPasskeyVerify
);


// ======================================================
// PASSKEY STATUS
// ======================================================

// Check whether current logged-in account has a passkey
router.get(
    "/passkey/status",
    protect,
    getPasskeyStatus
);

export default router;