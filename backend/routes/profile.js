// backend/routes/profile.js
import express from "express";
import {
    getMyProfile,
    updateProfile,
    updateProfilePicture,
    changePassword,
    getUserProfile
} from "../controllers/profileController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/*
==========================================
Profile Routes
Base URL: /api/profile
==========================================
*/

/**
 * Get my profile
 * GET /api/profile/me
 */
router.get("/me", authenticateToken, getMyProfile);

/**
 * Update my profile
 * PUT /api/profile/update
 */
router.put("/update", authenticateToken, updateProfile);

/**
 * Update profile picture
 * PUT /api/profile/picture
 */
router.put("/picture", authenticateToken, updateProfilePicture);

/**
 * Change password
 * PUT /api/profile/password
 */
router.put("/password", authenticateToken, changePassword);

/**
 * Get user profile by ID
 * GET /api/profile/:id
 */
router.get("/:id", authenticateToken, getUserProfile);

export default router;
