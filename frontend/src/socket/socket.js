// frontend/src/socket/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
});

export default socket;
