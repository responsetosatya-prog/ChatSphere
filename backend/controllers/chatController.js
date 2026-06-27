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
        const otherUserId = req.params.userId;

        // Find conversation
        let conversation = await findConversation(userId, otherUserId);

        if (!conversation) {

            return res.json({
                success: true,
                messages: []
            });

        }

        const result = await pool.query(

            `
            SELECT *
            FROM messages
            WHERE conversation_id = $1
            ORDER BY created_at ASC
            `,

            [conversation.id]

        );

        res.json({
            success: true,
            messages: result.rows
        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to load messages"
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

        if (!receiver_id || (!message && !req.body.media_url)) {

            return res.status(400).json({
                success: false,
                message: "Invalid message data"
            });

        }

        // Find or create conversation
        let conversation = await findConversation(senderId, receiver_id);

        if (!conversation) {

            conversation = await createConversation(senderId, receiver_id);

        }

        // Insert message
        const result = await pool.query(

            `
            INSERT INTO messages
            (conversation_id, sender_id, receiver_id, message)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,

            [
                conversation.id,
                senderId,
                receiver_id,
                message
            ]

        );

        const newMessage = result.rows[0];

        // Update conversation last message
        await updateConversation(conversation.id, message);

        res.status(201).json({
            success: true,
            data: newMessage
        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to send message"
        });

    }

}
