// backend/models/User.js
import pool from "../config/database.js";

/*
==========================================
Create Users Table
==========================================
*/

export async function createUsersTable() {
    const query = `
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
    );
    `;

    try {
        await pool.query(query);
        console.log("✅ Users table created.");
    } catch (error) {
        console.error("❌ Error creating users table");
        console.error(error);
    }
}

/*
==========================================
Create User
==========================================
*/

export async function createUser(user) {
    const query = `
    INSERT INTO users(
        full_name,
        username,
        email,
        password
    )
    VALUES($1, $2, $3, $4)
    RETURNING *;
    `;

    const values = [
        user.full_name,
        user.username,
        user.email,
        user.password
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
}

/*
==========================================
Find User By Email
==========================================
*/

export async function findUserByEmail(email) {
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );
    return result.rows[0];
}

/*
==========================================
Find User By Username
==========================================
*/

export async function findUserByUsername(username) {
    const result = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
    );
    return result.rows[0];
}

/*
==========================================
Find User By ID
==========================================
*/

export async function findUserById(id) {
    const result = await pool.query(
        "SELECT id, full_name, username, email, profile_picture, bio, location, website, role, status, is_online, last_seen, created_at FROM users WHERE id = $1",
        [id]
    );
    return result.rows[0];
}

/*
==========================================
Get All Users
==========================================
*/

export async function getAllUsers() {
    const result = await pool.query(
        "SELECT id, full_name, username, email, profile_picture, bio, role, status FROM users ORDER BY created_at DESC"
    );
    return result.rows;
}

/*
==========================================
Update User Status
==========================================
*/

export async function updateUserStatus(id, status) {
    const result = await pool.query(
        `UPDATE users
        SET status = $1,
            updated_at = NOW()
        WHERE id = $2
        RETURNING *`,
        [status, id]
    );
    return result.rows[0];
}

/*
==========================================
Update User Profile
==========================================
*/

export async function updateUserProfile(id, data) {
    const { full_name, username, email, bio, location, website, profile_picture } = data;
    
    const result = await pool.query(
        `UPDATE users
        SET full_name = COALESCE($1, full_name),
            username = COALESCE($2, username),
            email = COALESCE($3, email),
            bio = COALESCE($4, bio),
            location = COALESCE($5, location),
            website = COALESCE($6, website),
            profile_picture = COALESCE($7, profile_picture),
            updated_at = NOW()
        WHERE id = $8
        RETURNING id, full_name, username, email, bio, location, website, profile_picture, role, status`,
        [full_name, username, email, bio, location, website, profile_picture, id]
    );
    return result.rows[0];
}

/*
==========================================
Update Password
==========================================
*/

export async function updatePassword(id, hashedPassword) {
    const result = await pool.query(
        `UPDATE users
        SET password = $1,
            updated_at = NOW()
        WHERE id = $2
        RETURNING id`,
        [hashedPassword, id]
    );
    return result.rows[0];
}

/*
==========================================
Check if username exists (excluding current user)
==========================================
*/

export async function usernameExists(username, excludeId) {
    const result = await pool.query(
        "SELECT id FROM users WHERE username = $1 AND id != $2",
        [username, excludeId]
    );
    return result.rows[0];
}

/*
==========================================
Check if email exists (excluding current user)
==========================================
*/

export async function emailExists(email, excludeId) {
    const result = await pool.query(
        "SELECT id FROM users WHERE email = $1 AND id != $2",
        [email, excludeId]
    );
    return result.rows[0];
}

/*
==========================================
Update User Online Status
==========================================
*/

export async function updateUserOnline(id, isOnline) {
    await pool.query(
        `UPDATE users
        SET is_online = $1,
            last_seen = NOW()
        WHERE id = $2`,
        [isOnline, id]
    );
}
