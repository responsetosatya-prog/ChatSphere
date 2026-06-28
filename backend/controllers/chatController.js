import pool from "../config/database.js";
import { findConversation, createConversation, updateConversation } from "../models/Conversation.js";
import { createMessage, getMessageById, markMessagesAsSeen } from "../models/Message.js";

export async function getMessages(req, res) {
    try {
        const userId = req.user.id;
        const otherUserId = parseInt(req.params.userId);

        if (!otherUserId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        let conversation = await findConversation(userId, otherUserId);
        if (!conversation) {
            return res.json({
                success: true,
                messages: [],
            });
        }

        // Mark messages as seen
        await markMessagesAsSeen(conversation.id, userId);

        const result = await pool.query(
            `SELECT m.*, 
                    sender.full_name as sender_name,
                    reply_msg.message as reply_to_message,
                    reply_user.full_name as reply_to_sender_name
             FROM messages m
             LEFT JOIN users sender ON m.sender_id = sender.id
             LEFT JOIN messages reply_msg ON m.reply_to_message_id = reply_msg.id
             LEFT JOIN users reply_user ON reply_msg.sender_id = reply_user.id
             WHERE m.conversation_id = $1
             ORDER BY m.created_at ASC`,
            [conversation.id]
        );

        res.json({
            success: true,
            messages: result.rows,
        });

    } catch (error) {
        console.error("Error in getMessages:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load messages",
        });
    }
}

export async function sendMessage(req, res) {
    try {
        const senderId = req.user.id;
        const { receiver_id, message, reply_to_message_id } = req.body;

        if (!receiver_id) {
            return res.status(400).json({
                success: false,
                message: "Receiver ID is required",
            });
        }

        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Message cannot be empty",
            });
        }

        let conversation = await findConversation(senderId, receiver_id);
        if (!conversation) {
            conversation = await createConversation(senderId, receiver_id);
        }

        const newMessage = await createMessage({
            conversation_id: conversation.id,
            sender_id: senderId,
            receiver_id: receiver_id,
            message: message.trim(),
            reply_to_message_id: reply_to_message_id || null,
        });

        await updateConversation(conversation.id, message.trim());

        const fullMessage = await getMessageById(newMessage.id);

        res.status(201).json({
            success: true,
            data: fullMessage || newMessage,
        });

    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send message",
        });
    }
}
