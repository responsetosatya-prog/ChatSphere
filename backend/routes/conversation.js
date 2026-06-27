import express from "express";

import {
    getConversations,
    startConversation
} from "../controllers/conversationController.js";

import {
    authenticateToken
} from "../middleware/auth.js";

const router = express.Router();

/*
==========================================
Conversation Routes
Base URL: /api/conversations
==========================================
*/

/**
 * Get all conversations
 * GET /api/conversations
 */
router.get(
    "/",
    authenticateToken,
    getConversations
);

/**
 * Start a new conversation
 * POST /api/conversations
 */
router.post(
    "/",
    authenticateToken,
    startConversation
);

export default router;
