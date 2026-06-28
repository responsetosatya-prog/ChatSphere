import express from "express";
import pool from "../config/database.js";
import { getConversations, startConversation } from "../controllers/conversationController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, getConversations);
router.post("/", authenticateToken, startConversation);

// Get all users
router.get("/users", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, username, full_name, email, profile_picture, is_online
             FROM users 
             WHERE id != $1 AND status = 'approved'
             ORDER BY username ASC`,
            [req.user.id]
        );

        res.json({
            success: true,
            users: result.rows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

export default router;
