import pool from "../config/database.js";

export async function getDashboard(req, res) {
    try {
        const [totalUsers, pendingUsers, approvedUsers, blockedUsers, totalMessages] = await Promise.all([
            pool.query("SELECT COUNT(*) FROM users"),
            pool.query("SELECT COUNT(*) FROM users WHERE status='pending'"),
            pool.query("SELECT COUNT(*) FROM users WHERE status='approved'"),
            pool.query("SELECT COUNT(*) FROM users WHERE status='blocked'"),
            pool.query("SELECT COUNT(*) FROM messages")
        ]);

        // Recent activity
        const recentActivity = await pool.query(
            `SELECT u.username, u.full_name, u.status, u.created_at
             FROM users u
             ORDER BY u.created_at DESC
             LIMIT 10`
        );

        res.json({
            success: true,
            statistics: {
                totalUsers: Number(totalUsers.rows[0].count),
                pendingUsers: Number(pendingUsers.rows[0].count),
                approvedUsers: Number(approvedUsers.rows[0].count),
                blockedUsers: Number(blockedUsers.rows[0].count),
                totalMessages: Number(totalMessages.rows[0].count)
            },
            recentActivity: recentActivity.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

export async function getUsers(req, res) {
    try {
        const users = await pool.query(
            `SELECT id, full_name, username, email, role, status, profile_picture, created_at
             FROM users
             ORDER BY created_at DESC`
        );
        res.json({ success: true, users: users.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to fetch users." });
    }
}

export async function approveUser(req, res) {
    try {
        const { id } = req.params;
        await pool.query(
            `UPDATE users SET status='approved', updated_at=NOW() WHERE id=$1`,
            [id]
        );
        res.json({ success: true, message: "User approved successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Approval failed." });
    }
}

export async function blockUser(req, res) {
    try {
        const { id } = req.params;
        await pool.query(
            `UPDATE users SET status='blocked', updated_at=NOW() WHERE id=$1`,
            [id]
        );
        res.json({ success: true, message: "User blocked successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to block user." });
    }
}

export async function deleteUser(req, res) {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM users WHERE id=$1", [id]);
        res.json({ success: true, message: "User deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to delete user." });
    }
}

export async function updateUserRole(req, res) {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        await pool.query(
            `UPDATE users SET role=$1, updated_at=NOW() WHERE id=$2`,
            [role, id]
        );
        res.json({ success: true, message: "User role updated successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to update role." });
    }
}
