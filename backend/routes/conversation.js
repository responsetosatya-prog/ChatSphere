// backend/routes/conversation.js - Updated
import express from "express";
import {
    getConversations,
    startConversation
} from "../controllers/conversationController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get all conversations for current user
router.get("/", authenticateToken, getConversations);

// Start a new conversation
router.post("/", authenticateToken, startConversation);

// Get all users for starting conversations
router.get("/users", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT id, username, full_name, email, profile_picture
            FROM users
            WHERE id != $1
            AND status = 'approved'
            ORDER BY username ASC
            `,
            [req.user.id]
        );
        res.json({
            success: true,
            users: result.rows
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
