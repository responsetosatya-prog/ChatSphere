// backend/server.js
import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";

import pool from "./config/database.js";
import { initializeDatabase } from "./config/initDatabase.js";

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import chatRoutes from "./routes/chat.js";
import conversationRoutes from "./routes/conversation.js";
import uploadRoutes from "./routes/upload.js";
import profileRoutes from "./routes/profile.js";
import userRoutes from "./routes/users.js";

// ✅ ADD THIS IMPORT
import tempAdminRoutes from "./routes/temp-admin.js";

import { initializeSocket } from "./socket/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// backend/server.js - Add this after creating the app
const app = express();

// ✅ Add this line to fix the X-Forwarded-For warning
app.set('trust proxy', 1);

// ... rest of your code ...
const server = http.createServer(app);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());
app.use("/api", limiter);

// Static files
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

// ==========================================
// ROUTES
// ==========================================
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/users", userRoutes);

// ✅ ADD THIS TEMPORARY ADMIN ROUTE (after other routes)
app.use("/api/temp-admin", tempAdminRoutes);

// Health check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "🚀 ChatSphere Backend is Running",
        timestamp: new Date().toISOString()
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error("❌ Error:", err);
    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await initializeDatabase();
        const io = initializeSocket(server);
        
        server.listen(PORT, () => {
            console.log(`
╔══════════════════════════════════════════╗
║     🚀 ChatSphere Backend Started        ║
╠══════════════════════════════════════════╣
║  Port: ${PORT.padEnd(40)}║
║  Environment: ${(process.env.NODE_ENV || "development").padEnd(37)}║
║  Socket.IO: ACTIVE${" ".padEnd(40)}║
║  Database: CONNECTED${" ".padEnd(41)}║
╚══════════════════════════════════════════╝
`);
        });
    } catch (error) {
        console.error("❌ Server startup failed:", error);
        process.exit(1);
    }
}

startServer();
