// backend/controllers/authController.js
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";
import pool from "../config/database.js";

export async function register(req, res) {
    try {
        const {
            full_name,
            username,
            email,
            password
        } = req.body;

        if (!full_name || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields."
            });
        }

        // Check if email exists
        const emailCheck = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );
        if (emailCheck.rows[0]) {
            return res.status(409).json({
                success: false,
                message: "Email already exists."
            });
        }

        // Check if username exists
        const usernameCheck = await pool.query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        );
        if (usernameCheck.rows[0]) {
            return res.status(409).json({
                success: false,
                message: "Username already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Auto-approve users (remove pending status)
        const result = await pool.query(
            `INSERT INTO users (full_name, username, email, password, status, role)
             VALUES ($1, $2, $3, $4, 'approved', 'user')
             RETURNING id, full_name, username, email, status, role`,
            [full_name, username, email, hashedPassword]
        );

        const newUser = result.rows[0];

        return res.status(201).json({
            success: true,
            message: "Registration successful! You can now login.",
            user: {
                id: newUser.id,
                full_name: newUser.full_name,
                username: newUser.username,
                email: newUser.email,
                status: newUser.status,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Registration failed."
        });
    }
}
