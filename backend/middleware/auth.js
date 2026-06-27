import jwt from "jsonwebtoken";

/**
 * ======================================
 * Verify User Authentication
 * ======================================
 */

export function authenticateToken(req, res, next) {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {

            return res.status(401).json({

                success: false,

                message: "Access denied. No token provided."

            });

        }

        const token = authHeader.split(" ")[1];

        if (!token) {

            return res.status(401).json({

                success: false,

                message: "Invalid token."

            });

        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    }

    catch (error) {

        return res.status(401).json({

            success: false,

            message: "Token is invalid or expired."

        });

    }

}

/**
 * ======================================
 * Admin Only Middleware
 * ======================================
 */

export function requireAdmin(req, res, next) {

    if (!req.user) {

        return res.status(401).json({

            success: false,

            message: "Unauthorized."

        });

    }

    if (req.user.role !== "admin") {

        return res.status(403).json({

            success: false,

            message: "Admin access required."

        });

    }

    next();

}
