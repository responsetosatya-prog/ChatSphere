import express from "express";
import pool from "../config/database.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard stats
router.get("/dashboard", async (req, res) => {
    try {
        const [totalUsers, pendingUsers, approvedUsers, blockedUsers, totalMessages] = await Promise.all([
            pool.query("SELECT COUNT(*) FROM users"),
            pool.query("SELECT COUNT
