import pool from "../config/database.js";

export async function findConversation(userOne, userTwo) {
    const result = await pool.query(
        `SELECT * FROM conversations 
         WHERE (user_one_id = $1 AND user_two_id = $2) 
            OR (user_one_id = $2 AND user_two_id = $1) 
         LIMIT 1`,
        [userOne, userTwo]
    );
    return result.rows[0];
}

export async function createConversation(userOne, userTwo) {
    const result = await pool.query(
        `INSERT INTO conversations (user_one_id, user_two_id) 
         VALUES ($1, $2) RETURNING *`,
        [userOne, userTwo]
    );
    return result.rows[0];
}

export async function getUserConversations(userId) {
    const result = await pool.query(
        `SELECT 
            c.*,
            u1.id as user_one_id, u1.username as user_one_username, u1.full_name as user_one_name, u1.profile_picture as user_one_picture,
            u2.id as user_two_id, u2.username as user_two_username, u2.full_name as user_two_name, u2.profile_picture as user_two_picture
         FROM conversations c
         LEFT JOIN users u1 ON c.user_one_id = u1.id
         LEFT JOIN users u2 ON c.user_two_id = u2.id
         WHERE c.user_one_id = $1 OR c.user_two_id = $1
         ORDER BY c.last_message_at DESC`,
        [userId]
    );
    return result.rows.map(row => ({
        id: row.id,
        last_message: row.last_message || '',
        last_message_at: row.last_message_at,
        created_at: row.created_at,
        user_one: {
            id: row.user_one_id,
            username: row.user_one_username,
            full_name: row.user_one_name,
            profile_picture: row.user_one_picture,
        },
        user_two: {
            id: row.user_two_id,
            username: row.user_two_username,
            full_name: row.user_two_name,
            profile_picture: row.user_two_picture,
        }
    }));
}

export async function updateConversation(conversationId, message) {
    await pool.query(
        `UPDATE conversations 
         SET last_message = $1, last_message_at = NOW() 
         WHERE id = $2`,
        [message, conversationId]
    );
}
