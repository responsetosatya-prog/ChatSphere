import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import socket from "../socket/socket";
import ChatHeader from "../components/ChatHeader";

function Chat() {

    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    const messagesEndRef = useRef(null);

    const userString = localStorage.getItem("user");
const user = userString ? JSON.parse(userString) : null;

if (!user) {
    return <h2 style={{ color: "white" }}>User not found. Please log in again.</h2>;
}
    const token = localStorage.getItem("token");

    /*
    ==========================================
    AUTO SCROLL
    ==========================================
    */
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    /*
    ==========================================
    LOAD CONVERSATIONS
    ==========================================
    */
    const loadConversations = async () => {

        try {

            const res = await API.get("/conversations", {
                headers: { Authorization: `Bearer ${token}` }
            });

            setConversations(res.data.conversations);

        } catch (err) {
            console.error(err);
        }

    };

    /*
    ==========================================
    LOAD MESSAGES (DEDUP SAFE)
    ==========================================
    */
    const loadMessages = async (otherUser) => {

    try {

        const res = await API.get(`/chat/${otherUser.id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const unique = Array.from(
            new Map(res.data.messages.map(m => [m.id, m])).values()
        );

        setMessages(unique);

        // SAVE THE WHOLE USER OBJECT
        setSelectedUser(otherUser);

        socket.emit("join-conversation", otherUser.id);

    } catch (err) {
        console.error(err);
    }

};

    /*
    ==========================================
    SEND MESSAGE (NO DUPLICATE ISSUE FIX)
    ==========================================
    */
    const sendMessage = async () => {

        if (!text.trim() || !selectedUser) return;

        try {

            const res = await API.post(
                "/chat/send",
                {
                    receiver_id: selectedUser.id,
                    message: text
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const newMessage = res.data.data;

            // FIX: prevent duplicates (check ID)
            setMessages((prev) => {

                const exists = prev.find(m => m.id === newMessage.id);
                if (exists) return prev;

                return [...prev, newMessage];

            });

            socket.emit("send-message", newMessage);

            setText("");

        } catch (err) {
            console.error(err);
        }

    };

    /*
    ==========================================
    SOCKET EVENTS (DEDUP SAFE)
    ==========================================
    */
    useEffect(() => {

        socket.connect();

        socket.emit("user-online", user.id);

        socket.on("receive-message", (message) => {

            setMessages((prev) => {

                const exists = prev.find(m => m.id === message.id);
                if (exists) return prev;

                return [...prev, message];

            });

        });

        return () => {
            socket.disconnect();
        };

    }, []);

    /*
    ==========================================
    INIT
    ==========================================
    */
    useEffect(() => {
        loadConversations();
    }, []);

    return (

        <div style={styles.container}>

            {/* SIDEBAR */}
            <div style={styles.sidebar}>
                <h3 style={{ color: "white" }}>Chats</h3>

                {conversations.map((c, i) => {

    const otherUser =
        c.user_one.id === user.id
            ? c.user_two
            : c.user_one;

    return (
        <div
            key={i}
            style={styles.chatItem}
            onClick={() => loadMessages(otherUser)}
        >

            <strong>{otherUser.username}</strong>

            <p style={{ fontSize: 12, color: "#94a3b8" }}>
                {c.last_message || "No messages yet"}
            </p>

        </div>
    );

})}
            </div>

            {/* CHAT BOX */}
            <div style={styles.chatBox}>

                {selectedUser ? (
    <>
        <ChatHeader
            user={user}
            selectedUser={selectedUser}
            onlineUsers={[]}
        />

        <div style={styles.messages}>

                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    style={{
                                        ...styles.message,
                                        alignSelf:
                                            m.sender_id === user.id
                                                ? "flex-end"
                                                : "flex-start",
                                        background:
                                            m.sender_id === user.id
                                                ? "#3b82f6"
                                                : "#334155"
                                    }}
                                >
                                    {m.message}
                                </div>
                            ))}

                            <div ref={messagesEndRef} />

                        </div>

                        <div style={styles.inputBox}>
                            <input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Type message..."
                                style={styles.input}
                            />

                            <button
                                onClick={sendMessage}
                                style={styles.button}
                            >
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <h3 style={{ color: "white" }}>
                        Select a chat
                    </h3>
                )}

            </div>

        </div>

    );

}

/*
==========================================
STYLES
==========================================
*/
const styles = {

    container: {
        display: "flex",
        height: "100vh",
        background: "#0f172a"
    },

    sidebar: {
        width: "30%",
        background: "#1e293b",
        padding: "10px",
        overflowY: "auto"
    },

    chatBox: {
        width: "70%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "10px"
    },

    chatItem: {
        padding: "10px",
        margin: "5px 0",
        background: "#334155",
        color: "white",
        borderRadius: "5px",
        cursor: "pointer"
    },

    messages: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        overflowY: "auto"
    },

    message: {
        padding: "10px",
        borderRadius: "10px",
        color: "white",
        maxWidth: "60%"
    },

    inputBox: {
        display: "flex",
        gap: "10px"
    },

    input: {
        flex: 1,
        padding: "10px",
        borderRadius: "5px",
        border: "none"
    },

    button: {
        padding: "10px",
        background: "#22c55e",
        color: "white",
        border: "none",
        borderRadius: "5px"
    }
};

export default Chat;
