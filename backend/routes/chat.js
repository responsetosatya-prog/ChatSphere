// backend/routes/chat.js
import express from "express";
import {
    getMessages,
    sendMessage
} from "../controllers/chatController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/*
==========================================
Chat Routes
Base URL: /api/chat
==========================================
*/

// Get messages with another user
router.get("/:userId", authenticateToken, getMessages);

// Send a message
router.post("/send", authenticateToken, sendMessage);

export default router;
