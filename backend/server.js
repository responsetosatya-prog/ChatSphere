import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";

import pool from "./config/database.js";
import { initializeDatabase } from "./config/initDatabase.js";

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import chatRoutes from "./routes/chat.js";
import conversationRoutes from "./routes/conversation.js";
import uploadRoutes from "./routes/upload.js";
import profileRoutes from "./routes/profile.js";

import { initializeSocket } from "./socket/socket.js";

/*
==========================================
CONFIG
==========================================
*/

dotenv.config();

const app = express();
const server = http.createServer(app);

/*
==========================================
MIDDLEWARE
==========================================
*/

app.use(helmet());

app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
}));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/*
==========================================
STATIC FILES (UPLOADS)
==========================================
*/

app.use(
    "/uploads",
    express.static(path.resolve("uploads"))
);

/*
==========================================
API ROUTES
==========================================
*/

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/profile", profileRoutes);

/*
==========================================
HEALTH CHECK
==========================================
*/

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "🚀 ChatSphere Backend is Running"
    });

});

/*
==========================================
START SERVER
==========================================
*/

const PORT = process.env.PORT || 5000;

async function startServer() {

    try {

        await initializeDatabase();

        const io = initializeSocket(server);

        server.listen(PORT, () => {

            console.log(`
=========================================
🚀 ChatSphere Backend Started
=========================================
Port: ${PORT}
Environment: ${process.env.NODE_ENV || "development"}
Socket.IO: ACTIVE
Database: CONNECTED
=========================================
`);

        });

    }

    catch (error) {

        console.error("❌ Server startup failed:", error);
        process.exit(1);

    }

}

startServer();
