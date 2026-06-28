// backend/socket/socket.js
import { Server } from "socket.io";
import SOCKET_EVENTS from "./socket.events.js";

const onlineUsers = new Map();

export function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true,
            allowedHeaders: ["Authorization"]
        },
        transports: ["websocket", "polling"],
        pingTimeout: 60000,
        pingInterval: 25000
    });

    io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
        console.log(`🟢 User Connected: ${socket.id}`);

        // Store user ID with socket
        let currentUserId = null;

        socket.on(SOCKET_EVENTS.USER_ONLINE, (userId) => {
            currentUserId = userId;
            onlineUsers.set(userId, socket.id);
            
            // Broadcast online users to everyone
            io.emit(SOCKET_EVENTS.ONLINE_USERS, [...onlineUsers.keys()]);
            console.log(`👤 User ${userId} is online (${onlineUsers.size} users online)`);
        });

        socket.on(SOCKET_EVENTS.JOIN_CONVERSATION, (conversationId) => {
            const room = `conversation-${conversationId}`;
            socket.join(room);
            console.log(`📨 User joined room: ${room}`);
        });

        socket.on(SOCKET_EVENTS.SEND_MESSAGE, (message) => {
            console.log(`📤 Message sent:`, message);
            
            // Emit to the specific conversation room
            const room = `conversation-${message.conversation_id || message.receiver_id}`;
            
            // Send to everyone in the room including sender
            io.to(room).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, message);
            
            // Also send to receiver's individual socket if online
            const receiverSocketId = onlineUsers.get(message.receiver_id);
            if (receiverSocketId && receiverSocketId !== socket.id) {
                io.to(receiverSocketId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, message);
            }
        });

        socket.on(SOCKET_EVENTS.TYPING, (data) => {
            const room = `conversation-${data.conversationId}`;
            socket.to(room).emit(SOCKET_EVENTS.USER_TYPING, {
                userId: currentUserId,
                conversationId: data.conversationId
            });
        });

        socket.on(SOCKET_EVENTS.STOP_TYPING, (data) => {
            const room = `conversation-${data.conversationId}`;
            socket.to(room).emit(SOCKET_EVENTS.USER_STOP_TYPING, {
                userId: currentUserId,
                conversationId: data.conversationId
            });
        });

        socket.on(SOCKET_EVENTS.MESSAGES_SEEN, (data) => {
            const room = `conversation-${data.conversationId}`;
            socket.to(room).emit(SOCKET_EVENTS.MESSAGES_SEEN, data);
        });

        socket.on(SOCKET_EVENTS.DISCONNECT, () => {
            if (currentUserId) {
                onlineUsers.delete(currentUserId);
                io.emit(SOCKET_EVENTS.ONLINE_USERS, [...onlineUsers.keys()]);
                console.log(`👤 User ${currentUserId} went offline (${onlineUsers.size} users online)`);
            }
            console.log(`🔴 User Disconnected: ${socket.id}`);
        });
    });

    return io;
}
