// backend/controllers/chatController.js
import pool from "../config/database.js";
import {
    findConversation,
    createConversation,
    updateConversation
} from "../models/Conversation.js";

/*
==========================================
Get Messages Between Users
GET /api/chat/:userId
==========================================
*/

export async function getMessages(req, res) {
    try {
        const userId = req.user.id;
        const otherUserId = parseInt(req.params.userId);

        console.log(`Getting messages between ${userId} and ${otherUserId}`);

        if (!otherUserId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        // Find conversation
        let conversation = await findConversation(userId, otherUserId);

        if (!conversation) {
            // No conversation yet, return empty messages
            return res.json({
                success: true,
                messages: []
            });
        }

        const result = await pool.query(
            `
            SELECT 
                id,
                sender_id,
                receiver_id,
                message,
                message_type,
                media_url,
                is_seen,
                created_at,
                updated_at
            FROM messages
            WHERE conversation_id = $1
            ORDER BY created_at ASC
            `,
            [conversation.id]
        );

        console.log(`Found ${result.rows.length} messages`);

        res.json({
            success: true,
            messages: result.rows
        });

    } catch (error) {
        console.error("Error in getMessages:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load messages",
            error: error.message
        });
    }
}

/*
==========================================
Send Message
POST /api/chat/send
==========================================
*/

export async function sendMessage(req, res) {
    try {
        const senderId = req.user.id;
        const { receiver_id, message } = req.body;

        console.log(`Sending message from ${senderId} to ${receiver_id}: ${message}`);

        if (!receiver_id) {
            return res.status(400).json({
                success: false,
                message: "Receiver ID is required"
            });
        }

        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Message cannot be empty"
            });
        }

        // Find or create conversation
        let conversation = await findConversation(senderId, receiver_id);

        if (!conversation) {
            console.log("Creating new conversation");
            conversation = await createConversation(senderId, receiver_id);
        }

        console.log("Conversation ID:", conversation.id);

        // Insert message
        const result = await pool.query(
            `
            INSERT INTO messages
            (conversation_id, sender_id, receiver_id, message, message_type)
            VALUES ($1, $2, $3, $4, 'text')
            RETURNING *
            `,
            [
                conversation.id,
                senderId,
                receiver_id,
                message.trim()
            ]
        );

        const newMessage = result.rows[0];
        console.log("Message created:", newMessage);

        // Update conversation last message
        await updateConversation(conversation.id, message.trim());

        res.status(201).json({
            success: true,
            data: newMessage
        });

    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send message",
            error: error.message
        });
    }
}
