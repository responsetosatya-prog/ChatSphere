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

// All routes require authentication
router.use(authenticateToken);

/**
 * Get my profile
 * GET /api/profile/me
 */
router.get("/me", getMyProfile);

/**
 * Update my profile
 * PUT /api/profile/update
 */
router.put("/update", updateProfile);

/**
 * Update profile picture
 * PUT /api/profile/picture
 */
router.put("/picture", updateProfilePicture);

/**
 * Change password
 * PUT /api/profile/password
 */
router.put("/password", changePassword);

/**
 * Get user profile by ID
 * GET /api/profile/:id
 */
router.get("/:id", getUserProfile);

export default router;
