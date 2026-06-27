import pool from "../config/database.js";

/*
==========================================
Get Dashboard Statistics
GET /api/admin/dashboard
==========================================
*/

export async function getDashboard(req, res) {

    try {

        const totalUsers =
            await pool.query("SELECT COUNT(*) FROM users");

        const pendingUsers =
            await pool.query("SELECT COUNT(*) FROM users WHERE status='pending'");

        const approvedUsers =
            await pool.query("SELECT COUNT(*) FROM users WHERE status='approved'");

        const blockedUsers =
            await pool.query("SELECT COUNT(*) FROM users WHERE status='blocked'");

        res.json({

            success: true,

            statistics: {

                totalUsers: Number(totalUsers.rows[0].count),

                pendingUsers: Number(pendingUsers.rows[0].count),

                approvedUsers: Number(approvedUsers.rows[0].count),

                blockedUsers: Number(blockedUsers.rows[0].count)

            }

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            message:"Server Error"

        });

    }

}

/*
==========================================
Get All Users
GET /api/admin/users
==========================================
*/

export async function getUsers(req,res){

    try{

        const users = await pool.query(

            `SELECT
                id,
                full_name,
                username,
                email,
                role,
                status,
                created_at
            FROM users
            ORDER BY created_at DESC`

        );

        res.json({

            success:true,

            users:users.rows

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            message:"Unable to fetch users."

        });

    }

}

/*
==========================================
Approve User
PUT /api/admin/users/:id/approve
==========================================
*/

export async function approveUser(req,res){

    try{

        const { id } = req.params;

        await pool.query(

            `UPDATE users
             SET status='approved',
                 updated_at=NOW()
             WHERE id=$1`,

            [id]

        );

        res.json({

            success:true,

            message:"User approved successfully."

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            message:"Approval failed."

        });

    }

}

/*
==========================================
Block User
PUT /api/admin/users/:id/block
==========================================
*/

export async function blockUser(req,res){

    try{

        const { id } = req.params;

        await pool.query(

            `UPDATE users
             SET status='blocked',
                 updated_at=NOW()
             WHERE id=$1`,

            [id]

        );

        res.json({

            success:true,

            message:"User blocked successfully."

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            message:"Unable to block user."

        });

    }

}

/*
==========================================
Delete User
DELETE /api/admin/users/:id
==========================================
*/

export async function deleteUser(req,res){

    try{

        const { id } = req.params;

        await pool.query(

            "DELETE FROM users WHERE id=$1",

            [id]

        );

        res.json({

            success:true,

            message:"User deleted successfully."

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            message:"Unable to delete user."

        });

    }

}
