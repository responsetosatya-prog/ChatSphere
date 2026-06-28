import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";
import pool from "../config/database.js";
import { createUser, findUserByEmail, findUserByUsername } from "../models/User.js";

export async function register(req, res) {
    try {
        const { full_name, username, email, password } = req.body;

        if (!full_name || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields.",
            });
        }

        const emailExists = await findUserByEmail(email);
        if (emailExists) {
            return res.status(409).json({
                success: false,
                message: "Email already exists.",
            });
        }

        const usernameExists = await findUserByUsername(username);
        if (usernameExists) {
            return res.status(409).json({
                success: false,
                message: "Username already exists.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await createUser({
            full_name,
            username,
            email,
            password: hashedPassword,
        });

        return res.status(201).json({
            success: true,
            message: "Registration successful! You can now login.",
            user: {
                id: newUser.id,
                full_name: newUser.full_name,
                username: newUser.username,
                email: newUser.email,
                status: newUser.status,
            },
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Registration failed.",
        });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        if (user.status === "blocked") {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked.",
            });
        }

        // Update online status
        await pool.query("UPDATE users SET is_online = TRUE, last_seen = NOW() WHERE id = $1", [user.id]);

        const token = generateToken(user);

        return res.json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                username: user.username,
                email: user.email,
                profile_picture: user.profile_picture || '',
                role: user.role,
                status: user.status,
            },
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Login failed.",
        });
    }
}
