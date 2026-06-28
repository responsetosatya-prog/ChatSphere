// backend/socket/socket.js - Updated
import { Server } from "socket.io";
import SOCKET_EVENTS from "./socket.events.js";

const onlineUsers = new Map();

export function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "https://chatsphere-1-0in4.onrender.com",
            methods: ["GET", "POST"],
            credentials: true,
            allowedHeaders: ["Authorization"]
        },
        transports: ["websocket", "polling"]
    });

    io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
        console.log(`🟢 User Connected: ${socket.id}`);

        socket.on(SOCKET_EVENTS.USER_ONLINE, (userId) => {
            onlineUsers.set(userId, socket.id);
            io.emit(SOCKET_EVENTS.ONLINE_USERS, [...onlineUsers.keys()]);
            console.log(`👤 User ${userId} is online`);
        });

        socket.on(SOCKET_EVENTS.JOIN_CONVERSATION, (conversationId) => {
            socket.join(`conversation-${conversationId}`);
            console.log(`📨 User joined conversation: ${conversationId}`);
        });

        socket.on(SOCKET_EVENTS.SEND_MESSAGE, (message) => {
            const room = `conversation-${message.conversationId || message.receiver_id}`;
            io.to(room).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, message);
        });

        socket.on(SOCKET_EVENTS.TYPING, (data) => {
            socket.to(`conversation-${data.conversationId}`)
                .emit(SOCKET_EVENTS.USER_TYPING, data);
        });

        socket.on(SOCKET_EVENTS.STOP_TYPING, (data) => {
            socket.to(`conversation-${data.conversationId}`)
                .emit(SOCKET_EVENTS.USER_STOP_TYPING, data);
        });

        socket.on(SOCKET_EVENTS.MESSAGES_SEEN, (data) => {
            socket.to(`conversation-${data.conversationId}`)
                .emit(SOCKET_EVENTS.MESSAGES_SEEN, data);
        });

        socket.on(SOCKET_EVENTS.DISCONNECT, () => {
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    io.emit(SOCKET_EVENTS.ONLINE_USERS, [...onlineUsers.keys()]);
                    console.log(`👤 User ${userId} went offline`);
                    break;
                }
            }
            console.log(`🔴 User Disconnected: ${socket.id}`);
        });
    });

    return io;
}
