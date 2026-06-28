import express from "express";
import pool from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";
const router = express.Router();

/*
====================================
GET ALL USERS
====================================
*/

router.get(
    "/users",
    authenticateToken,
    async (req, res) => {

        try {

            const result = await pool.query(
                `
                SELECT
                    id,
                    username,
                    full_name,
                    email
                FROM users
                WHERE id != $1
                AND status='approved'
                ORDER BY username ASC
                `,
                [req.user.id]
            );

            res.json({
                success: true,
                users: result.rows
            });

        } catch (err) {

            console.error(err);

            res.status(500).json({
                success: false,
                message: err.message
            });

        }

    }
);

export default router;
