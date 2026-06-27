import express from "express";

import {
    sendMessage,
    getMessages,
    updateMessage,
    removeMessage,
    seenMessages
} from "../controllers/chatController.js";

import {
    authenticateToken
} from "../middleware/auth.js";

const router = express.Router();

/*
==========================================
Chat Routes
Base URL: /api/chat
==========================================
*/

/**
 * Send Message
 * POST /api/chat/send
 */
router.post(
    "/send",
    authenticateToken,
    sendMessage
);

/**
 * Get Conversation
 * GET /api/chat/:userId
 */
router.get(
    "/:userId",
    authenticateToken,
    getMessages
);

/**
 * Edit Message
 * PUT /api/chat/message/:id
 */
router.put(
    "/message/:id",
    authenticateToken,
    updateMessage
);

/**
 * Delete Message
 * DELETE /api/chat/message/:id
 */
router.delete(
    "/message/:id",
    authenticateToken,
    removeMessage
);

/**
 * Mark Messages as Seen
 * PUT /api/chat/seen/:userId
 */
router.put(
    "/seen/:userId",
    authenticateToken,
    seenMessages
);

export default router;
