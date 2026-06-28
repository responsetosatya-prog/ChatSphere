// backend/controllers/profileController.js
import pool from "../config/database.js";
import bcrypt from "bcrypt";

/*
==========================================
Get My Profile
GET /api/profile/me
==========================================
*/

export async function getMyProfile(req, res) {
    try {
        const userId = req.user.id;
        console.log("Fetching profile for user:", userId);

        const result = await pool.query(
            `SELECT 
                id, 
                full_name, 
                username, 
                email, 
                profile_picture, 
                bio, 
                location, 
                website, 
                role, 
                status, 
                is_online, 
                last_seen, 
                created_at 
            FROM users 
            WHERE id = $1`,
            [userId]
        );

        if (!result.rows[0]) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const user = result.rows[0];

        res.json({
            success: true,
            user: {
                id: user.id,
                full_name: user.full_name,
                username: user.username,
                email: user.email,
                profile_picture: user.profile_picture || '',
                bio: user.bio || '',
                location: user.location || '',
                website: user.website || '',
                role: user.role,
                status: user.status,
                is_online: user.is_online,
                last_seen: user.last_seen,
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error("Error in getMyProfile:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch profile.",
            error: error.message
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
        const { full_name, username, email, bio, location, website } = req.body;

        console.log("Updating profile for user:", userId);

        // Check if username is taken (excluding current user)
        if (username) {
            const existing = await pool.query(
                "SELECT id FROM users WHERE username = $1 AND id != $2",
                [username, userId]
            );
            if (existing.rows[0]) {
                return res.status(409).json({
                    success: false,
                    message: "Username is already taken."
                });
            }
        }

        // Check if email is taken (excluding current user)
        if (email) {
            const existing = await pool.query(
                "SELECT id FROM users WHERE email = $1 AND id != $2",
                [email, userId]
            );
            if (existing.rows[0]) {
                return res.status(409).json({
                    success: false,
                    message: "Email is already in use."
                });
            }
        }

        // Update profile
        const result = await pool.query(
            `UPDATE users
            SET full_name = COALESCE($1, full_name),
                username = COALESCE($2, username),
                email = COALESCE($3, email),
                bio = COALESCE($4, bio),
                location = COALESCE($5, location),
                website = COALESCE($6, website),
                updated_at = NOW()
            WHERE id = $7
            RETURNING 
                id, full_name, username, email, bio, location, website, 
                profile_picture, role, status`,
            [full_name, username, email, bio, location, website, userId]
        );

        res.json({
            success: true,
            message: "Profile updated successfully.",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Error in updateProfile:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update profile.",
            error: error.message
        });
    }
}

/*
==========================================
Update Profile Picture
PUT /api/profile/picture
==========================================
*/

export async function updateProfilePicture(req, res) {
    try {
        const userId = req.user.id;
        const { profile_picture } = req.body;

        console.log("Updating profile picture for user:", userId);

        if (!profile_picture) {
            return res.status(400).json({
                success: false,
                message: "Profile picture URL is required."
            });
        }

        const result = await pool.query(
            `UPDATE users
            SET profile_picture = $1,
                updated_at = NOW()
            WHERE id = $2
            RETURNING 
                id, full_name, username, email, profile_picture, bio, role, status`,
            [profile_picture, userId]
        );

        res.json({
            success: true,
            message: "Profile picture updated successfully.",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Error in updateProfilePicture:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update profile picture.",
            error: error.message
        });
    }
}

/*
==========================================
Change Password
PUT /api/profile/password
==========================================
*/

export async function changePassword(req, res) {
    try {
        const userId = req.user.id;
        const { current_password, new_password } = req.body;

        console.log("Changing password for user:", userId);

        if (!current_password || !new_password) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required."
            });
        }

        if (new_password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters."
            });
        }

        // Get current user with password
        const result = await pool.query(
            "SELECT password FROM users WHERE id = $1",
            [userId]
        );
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // Verify current password
        const isValid = await bcrypt.compare(current_password, user.password);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect."
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 10);
        
        await pool.query(
            "UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2",
            [hashedPassword, userId]
        );

        res.json({
            success: true,
            message: "Password changed successfully."
        });

    } catch (error) {
        console.error("Error in changePassword:", error);
        res.status(500).json({
            success: false,
            message: "Failed to change password.",
            error: error.message
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
        console.log("Fetching user profile for ID:", id);

        const result = await pool.query(
            `SELECT 
                id, 
                full_name, 
                username, 
                email, 
                profile_picture, 
                bio, 
                location, 
                website, 
                is_online, 
                last_seen, 
                created_at 
            FROM users 
            WHERE id = $1`,
            [id]
        );

        if (!result.rows[0]) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const user = result.rows[0];

        res.json({
            success: true,
            user: {
                id: user.id,
                full_name: user.full_name,
                username: user.username,
                profile_picture: user.profile_picture || '',
                bio: user.bio || '',
                location: user.location || '',
                website: user.website || '',
                is_online: user.is_online,
                last_seen: user.last_seen,
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error("Error in getUserProfile:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user profile.",
            error: error.message
        });
    }
}
