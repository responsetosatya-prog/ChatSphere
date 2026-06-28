import express from "express";
import pool from "../config/database.js";

const router = express.Router();

router.get("/approve/:email", async (req, res) => {
    try {
        await pool.query(
            "UPDATE users SET status = 'approved' WHERE email = $1",
            [req.params.email]
        );

        res.json({
            success: true,
            message: "User approved."
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Approval failed."
        });
    }
});

export default router;
