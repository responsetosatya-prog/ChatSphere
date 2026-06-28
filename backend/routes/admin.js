// backend/routes/admin.js - Updated
import express from "express";
import {
    getDashboard,
    getUsers,
    approveUser,
    blockUser,
    deleteUser
} from "../controllers/adminController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/admin/dashboard
 * Get dashboard statistics
 */
router.get("/dashboard", getDashboard);

/**
 * GET /api/admin/users
 * Get all users
 */
router.get("/users", getUsers);

/**
 * PUT /api/admin/users/:id/approve
 * Approve a user
 */
router.put("/users/:id/approve", approveUser);

/**
 * PUT /api/admin/users/:id/block
 * Block a user
 */
router.put("/users/:id/block", blockUser);

/**
 * DELETE /api/admin/users/:id
 * Delete a user
 */
router.delete("/users/:id", deleteUser);

export default router;
