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
            pool.query("SELECT COUNT(*) FROM users WHERE status='pending'"),
            pool.query("SELECT COUNT(*) FROM users WHERE status='approved'"),
            pool.query("SELECT COUNT(*) FROM users WHERE status='blocked'"),
            pool.query("SELECT COUNT(*) FROM messages"),
        ]);

        const recentUsers = await pool.query(
            `SELECT id, full_name, username, email, status, created_at 
             FROM users ORDER BY created_at DESC LIMIT 10`
        );

        res.json({
            success: true,
            statistics: {
                totalUsers: Number(totalUsers.rows[0].count),
                pendingUsers: Number(pendingUsers.rows[0].count),
                approvedUsers: Number(approvedUsers.rows[0].count),
                blockedUsers: Number(blockedUsers.rows[0].count),
                totalMessages: Number(totalMessages.rows[0].count),
            },
            recentUsers: recentUsers.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// Get all users
router.get("/users", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, full_name, username, email, profile_picture, role, status, created_at 
             FROM users ORDER BY created_at DESC`
        );
        res.json({ success: true, users: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to fetch users." });
    }
});

// Approve user
router.put("/users/:id/approve", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query(`UPDATE users SET status='approved', updated_at=NOW() WHERE id=$1`, [id]);
        res.json({ success: true, message: "User approved successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Approval failed." });
    }
});

// Block user
router.put("/users/:id/block", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query(`UPDATE users SET status='blocked', updated_at=NOW() WHERE id=$1`, [id]);
        res.json({ success: true, message: "User blocked successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to block user." });
    }
});

// Delete user
router.delete("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM users WHERE id=$1", [id]);
        res.json({ success: true, message: "User deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to delete user." });
    }
});

// Make admin
router.put("/users/:id/role", async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        await pool.query(`UPDATE users SET role=$1, updated_at=NOW() WHERE id=$2`, [role, id]);
        res.json({ success: true, message: "User role updated successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to update role." });
    }
});

export default router;
