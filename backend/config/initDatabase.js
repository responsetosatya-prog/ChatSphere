// backend/config/initDatabase.js - Updated with missing columns
import pool from "../config/database.js";

export async function initializeDatabase() {
    try {
        console.log("");
        console.log("======================================");
        console.log("Initializing ChatSphere Database...");
        console.log("======================================");

        // 1. Create users table with all columns
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(100) NOT NULL,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(120) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                profile_picture TEXT DEFAULT '',
                bio TEXT DEFAULT '',
                location VARCHAR(100) DEFAULT '',
                website VARCHAR(200) DEFAULT '',
                role VARCHAR(20) DEFAULT 'user',
                status VARCHAR(20) DEFAULT 'pending',
                is_online BOOLEAN DEFAULT FALSE,
                last_seen TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Users table ready");

        // 2. Add missing columns if they don't exist
        try {
            // Check if location column exists
            const checkLocation = await pool.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='location'
            `);
            
            if (checkLocation.rows.length === 0) {
                console.log("📝 Adding location column...");
                await pool.query(`ALTER TABLE users ADD COLUMN location VARCHAR(100) DEFAULT ''`);
                console.log("✅ location column added");
            }

            // Check if website column exists
            const checkWebsite = await pool.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='website'
            `);
            
            if (checkWebsite.rows.length === 0) {
                console.log("📝 Adding website column...");
                await pool.query(`ALTER TABLE users ADD COLUMN website VARCHAR(200) DEFAULT ''`);
                console.log("✅ website column added");
            }
        } catch (err) {
            console.log("ℹ️ Columns might already exist:", err.message);
        }

        // 3. Create conversations table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS conversations (
                id SERIAL PRIMARY KEY,
                user_one_id INTEGER NOT NULL,
                user_two_id INTEGER NOT NULL,
                last_message TEXT DEFAULT '',
                last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_user_one
                    FOREIGN KEY(user_one_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE,
                CONSTRAINT fk_user_two
                    FOREIGN KEY(user_two_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE,
                CONSTRAINT unique_conversation
                    UNIQUE(user_one_id, user_two_id)
            )
        `);
        console.log("✅ Conversations table ready");

        // 4. Create messages table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                conversation_id INTEGER,
                sender_id INTEGER NOT NULL,
                receiver_id INTEGER NOT NULL,
                message TEXT,
                message_type VARCHAR(20) DEFAULT 'text',
                media_url TEXT DEFAULT '',
                is_seen BOOLEAN DEFAULT FALSE,
                reply_to_message_id INTEGER,
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
            )
        `);
        console.log("✅ Messages table ready");

        // 5. Add foreign keys for messages
        try {
            await pool.query(`
                ALTER TABLE messages 
                ADD CONSTRAINT fk_conversation 
                FOREIGN KEY (conversation_id) 
                REFERENCES conversations(id) 
                ON DELETE CASCADE
            `);
            console.log("✅ Conversation foreign key added");
        } catch (err) {
            console.log("ℹ️ Conversation foreign key already exists");
        }

        try {
            await pool.query(`
                ALTER TABLE messages 
                ADD CONSTRAINT fk_reply_to
                FOREIGN KEY (reply_to_message_id)
                REFERENCES messages(id)
                ON DELETE SET NULL
            `);
            console.log("✅ Reply foreign key added");
        } catch (err) {
            console.log("ℹ️ Reply foreign key already exists");
        }

        console.log("");
        console.log("======================================");
        console.log("✅ Database Initialized Successfully");
        console.log("======================================");

    } catch (error) {
        console.error("❌ Database initialization error:", error);
    }
}
