import { createUsersTable } from "../models/User.js";
import { createMessagesTable } from "../models/Message.js";
import { createConversationsTable } from "../models/Conversation.js";
import pool from "./database.js";
import bcrypt from "bcrypt";

/*
==========================================
Initialize Database
==========================================
*/

export async function initializeDatabase() {

    try {

        console.log("");
        console.log("======================================");
        console.log("Initializing ChatSphere Database...");
        console.log("======================================");

        await createUsersTable();
        await createMessagesTable();
        await createConversationsTable();

        // Create admin user if not exists
        await createAdminUser();

        console.log("");
        console.log("======================================");
        console.log("✅ Database Initialized Successfully");
        console.log("======================================");
        console.log("");

    } catch(error) {
        console.error("");
        console.error("======================================");
        console.error("❌ Database Initialization Failed");
        console.error(error);
        console.error("======================================");
        process.exit(1);
    }

}

async function createAdminUser() {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@chatsphere.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    const existing = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [adminEmail]
    );

    if (existing.rows.length > 0) {
        console.log("✅ Admin user already exists");
        return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await pool.query(
        `INSERT INTO users 
         (full_name, username, email, password, role, status) 
         VALUES ($1, $2, $3, $4, 'admin', 'approved')`,
        [
            process.env.ADMIN_NAME || "Administrator",
            "admin",
            adminEmail,
            hashedPassword
        ]
    );

    console.log("✅ Admin user created successfully");
}
