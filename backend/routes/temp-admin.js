// backend/routes/temp-admin.js
import express from "express";
import pool from "../config/database.js";

const router = express.Router();

// Temporary route to make a user admin
// ⚠️ REMOVE THIS AFTER USE!
router.get("/make-admin/:email", async (req, res) => {
    try {
        const { email } = req.params;
        
        // Check if user exists
        const userCheck = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );
        
        if (userCheck.rows.length === 0) {
            return res.json({
                success: false,
                message: `User with email ${email} not found`
            });
        }
        
        // Make user admin
        await pool.query(
            "UPDATE users SET role = 'admin', status = 'approved' WHERE email = $1",
            [email]
        );
        
        // Get updated user
        const result = await pool.query(
            "SELECT id, full_name, email, role, status FROM users WHERE email = $1",
            [email]
        );
        
        res.json({
            success: true,
            message: `✅ User ${email} is now an admin!`,
            user: result.rows[0]
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
});

// Also make yourself admin directly (without email param)
router.get("/make-me-admin", async (req, res) => {
    try {
        // Get the most recently created user
        const result = await pool.query(
            "SELECT * FROM users ORDER BY id DESC LIMIT 1"
        );
        
        if (result.rows.length === 0) {
            return res.json({
                success: false,
                message: "No users found"
            });
        }
        
        const user = result.rows[0];
        
        // Make them admin
        await pool.query(
            "UPDATE users SET role = 'admin', status = 'approved' WHERE id = $1",
            [user.id]
        );
        
        res.json({
            success: true,
            message: `✅ ${user.full_name} (${user.email}) is now an admin!`,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: 'admin'
            }
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
});

export default router;
