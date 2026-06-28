import express from "express";
import pool from "../config/database.js";

const router = express.Router();

// Get all users
router.get("/users", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, full_name, email, status FROM users ORDER BY id DESC"
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Approve user
router.get("/approve/:email", async (req, res) => {
    try {
        const result = await pool.query(
            "UPDATE users SET status = 'approved' WHERE email = $1 RETURNING id, full_name, email, status",
            [req.params.email]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "User approved successfully",
            user: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

export default router;
