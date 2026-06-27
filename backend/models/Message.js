import pool from "../config/database.js";

/*
==========================================
Create Messages Table
==========================================
*/

export async function createMessagesTable() {

    const query = `

    CREATE TABLE IF NOT EXISTS messages (

        id SERIAL PRIMARY KEY,

        sender_id INTEGER NOT NULL,

        receiver_id INTEGER NOT NULL,

        message TEXT,

        message_type VARCHAR(20) DEFAULT 'text',

        media_url TEXT DEFAULT '',

        is_seen BOOLEAN DEFAULT FALSE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_sender
            FOREIGN KEY(sender_id)
            REFERENCES users(id)
            ON DELETE CASCADE,

        CONSTRAINT fk_receiver
            FOREIGN KEY(receiver_id)
            REFERENCES users(id)
            ON DELETE CASCADE

    );

    `;

    try {

        await pool.query(query);

        console.log("✅ Messages table created.");

    } catch (error) {

        console.error("❌ Error creating messages table");

        console.error(error);

    }

}

/*
==========================================
Send Message
==========================================
*/

export async function createMessage(data) {

    const query = `

    INSERT INTO messages(

        sender_id,
        receiver_id,
        message,
        message_type,
        media_url

    )

    VALUES($1,$2,$3,$4,$5)

    RETURNING *;

    `;

    const values = [

        data.sender_id,
        data.receiver_id,
        data.message,
        data.message_type || "text",
        data.media_url || ""

    ];

    const result = await pool.query(query, values);

    return result.rows[0];

}

/*
==========================================
Get Conversation
==========================================
*/

export async function getConversation(user1, user2) {

    const query = `

    SELECT *

    FROM messages

    WHERE

    (sender_id=$1 AND receiver_id=$2)

    OR

    (sender_id=$2 AND receiver_id=$1)

    ORDER BY created_at ASC;

    `;

    const result = await pool.query(query, [user1, user2]);

    return result.rows;

}

/*
==========================================
Mark Messages As Seen
==========================================
*/

export async function markSeen(senderId, receiverId) {

    await pool.query(

        `

        UPDATE messages

        SET is_seen=TRUE

        WHERE

        sender_id=$1

        AND

        receiver_id=$2

        `,

        [senderId, receiverId]

    );

}

/*
==========================================
Delete Message
==========================================
*/

export async function deleteMessage(id) {

    await pool.query(

        "DELETE FROM messages WHERE id=$1",

        [id]

    );

}

/*
==========================================
Edit Message
==========================================
*/

export async function editMessage(id, message) {

    const result = await pool.query(

        `

        UPDATE messages

        SET

        message=$1,

        updated_at=NOW()

        WHERE id=$2

        RETURNING *;

        `,

        [message, id]

    );

    return result.rows[0];

}
