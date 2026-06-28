// backend/config/initDatabase.js
import pool from "../config/database.js";
import { createUsersTable } from "../models/User.js";
import { createMessagesTable } from "../models/Message.js";
import { createConversationsTable } from "../models/Conversation.js";

/*
==========================================
Initialize Database with all tables
==========================================
*/

export async function initializeDatabase() {
    try {
        console.log("");
        console.log("======================================");
        console.log("Initializing ChatSphere Database...");
        console.log("======================================");

        // Create tables in correct order
        await createUsersTable();
        await createConversationsTable();
        
        // Add conversation_id column to messages table if it doesn't exist
        await ensureConversationIdColumn();
        
        await createMessagesTable();

        console.log("");
        console.log("======================================");
        console.log("✅ Database Initialized Successfully");
        console.log("======================================");
        console.log("");

    } catch (error) {
        console.error("");
        console.error("======================================");
        console.error("❌ Database Initialization Failed");
        console.error(error);
        console.error("======================================");
        process.exit(1);
    }
}

async function ensureConversationIdColumn() {
    try {
        // Check if conversation_id column exists
        const checkColumn = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='messages' AND column_name='conversation_id'
        `);

        if (checkColumn.rows.length === 0) {
            console.log("Adding conversation_id column to messages table...");
            
            // Add the column
            await pool.query(`
                ALTER TABLE messages 
                ADD COLUMN conversation_id INTEGER
            `);
            
            // Add foreign key constraint
            await pool.query(`
                ALTER TABLE messages 
                ADD CONSTRAINT fk_conversation 
                FOREIGN KEY (conversation_id) 
                REFERENCES conversations(id) 
                ON DELETE CASCADE
            `);
            
            console.log("✅ conversation_id column added successfully");
        } else {
            console.log("✅ conversation_id column already exists");
        }
    } catch (error) {
        console.log("Note: Could not add conversation_id column (might already exist)");
        // Don't throw error, continue with initialization
    }
}
