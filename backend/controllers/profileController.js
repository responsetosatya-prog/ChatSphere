import pool from "../config/database.js";

/*
==========================================
Get My Profile
GET /api/profile/me
==========================================
*/

export async function getMyProfile(req, res) {

    try {

        const userId = req.user.id;

        const result = await pool.query(

            `SELECT id, full_name, username, email, profile_picture, bio, role, status, created_at
             FROM users
             WHERE id=$1`,

            [userId]

        );

        res.json({
            success: true,
            user: result.rows[0]
        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch profile."
        });

    }

}

/*
==========================================
Update Profile
PUT /api/profile/update
==========================================
*/

export async function updateProfile(req, res) {

    try {

        const userId = req.user.id;

        const {
            full_name,
            username,
            bio,
            profile_picture
        } = req.body;

        const result = await pool.query(

            `UPDATE users
             SET full_name = COALESCE($1, full_name),
                 username = COALESCE($2, username),
                 bio = COALESCE($3, bio),
                 profile_picture = COALESCE($4, profile_picture),
                 updated_at = NOW()
             WHERE id=$5
             RETURNING id, full_name, username, email, profile_picture, bio`,

            [
                full_name,
                username,
                bio,
                profile_picture,
                userId
            ]

        );

        res.json({
            success: true,
            message: "Profile updated successfully.",
            user: result.rows[0]
        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update profile."
        });

    }

}

/*
==========================================
Get User Profile by ID
GET /api/profile/:id
==========================================
*/

export async function getUserProfile(req, res) {

    try {

        const { id } = req.params;

        const result = await pool.query(

            `SELECT id, full_name, username, profile_picture, bio, created_at
             FROM users
             WHERE id=$1`,

            [id]

        );

        if (!result.rows[0]) {

            return res.status(404).json({
                success: false,
                message: "User not found."
            });

        }

        res.json({
            success: true,
            user: result.rows[0]
        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch user profile."
        });

    }

}
