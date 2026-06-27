import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import { connectDatabase } from "./config/database.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import chatRoutes from "./routes/chat.js";
import { initializeDatabase } from "./config/initDatabase.js";
import conversationRoutes from "./routes/conversation.js";
import { initializeSocket } from "./socket/socket.js";
import path from "path";
import uploadRoutes from "./routes/upload.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

/* ============================
   Socket.IO
============================ */

const io = initializeSocket(server);

/* ============================
   Middleware
============================ */

app.use(helmet());

app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
}));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    "/uploads",
    express.static(path.resolve("uploads"))
);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300
});

app.use(limiter);

/* ============================
   Health Check
============================ */

app.get("/", (req, res) => {

    res.json({
        success: true,
        app: "ChatSphere",
        version: "1.0.0",
        status: "Running"
    });

});

/* ============================
   API Routes
============================ */

app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/chat", chatRoutes);

app.use("/api/conversations", conversationRoutes);

app.use("/api/upload", uploadRoutes);

/* ============================
   Socket Events
============================ */

io.on("connection", (socket) => {

    console.log("User Connected:", socket.id);

    socket.on("join-room", (roomId) => {

        socket.join(roomId);

        console.log(`Joined Room: ${roomId}`);

    });

    socket.on("send-message", (data) => {

        io.to(data.roomId).emit("receive-message", data);

    });

    socket.on("typing", (roomId) => {

        socket.to(roomId).emit("user-typing");

    });

    socket.on("disconnect", () => {

        console.log("User Disconnected:", socket.id);

    });

});

/* ============================
   Error Handler
============================ */

app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });

});

/* ============================
   Start Server
============================ */

const PORT = process.env.PORT || 5000;

async function startServer() {

    await connectDatabase();

    await initializeDatabase();

    server.listen(PORT, () => {

        console.log(`
=========================================
🚀 ChatSphere Backend Started
=========================================
Port: ${PORT}
Environment: ${process.env.NODE_ENV || "development"}
=========================================
`);

    });

}

startServer();
