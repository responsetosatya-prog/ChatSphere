import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import socket from "../socket/socket";

function Chat() {

    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null);

    const messagesEndRef = useRef(null);

    const user = JSON.parse(localStorage.getItem("user"));
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
    LOAD MESSAGES
    ==========================================
    */
    const loadMessages = async (userId) => {

        try {

            const res = await API.get(`/chat/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessages(res.data.messages);
            setSelectedUser(userId);

            socket.emit("join-conversation", userId);

        } catch (err) {
            console.error(err);
        }

    };

    /*
    ==========================================
    SEND MESSAGE
    ==========================================
    */
    const sendMessage = async () => {

        if (!text.trim()) return;

        try {

            const res = await API.post(
                "/chat/send",
                {
                    receiver_id: selectedUser,
                    message: text
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setMessages((prev) => [...prev, res.data.data]);

            socket.emit("send-message", res.data.data);

            setText("");

        } catch (err) {
            console.error(err);
        }

    };

    /*
    ==========================================
    TYPING
    ==========================================
    */
    const handleTyping = (e) => {

        setText(e.target.value);

        socket.emit("typing", {
            conversationId: selectedUser,
            userId: user.id
        });

        clearTimeout(window.typingTimeout);

        window.typingTimeout = setTimeout(() => {

            socket.emit("stop-typing", {
                conversationId: selectedUser,
                userId: user.id
            });

        }, 1000);

    };

    /*
    ==========================================
    SOCKET EVENTS
    ==========================================
    */
    useEffect(() => {

        socket.connect();

        socket.emit("user-online", user.id);

        socket.on("receive-message", (message) => {
            setMessages((prev) => [...prev, message]);
        });

        socket.on("user-typing", (data) => {
            if (data.userId !== user.id) {
                setTypingUser(data.userId);
                setIsTyping(true);
            }
        });

        socket.on("user-stop-typing", () => {
            setIsTyping(false);
            setTypingUser(null);
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
                        c.user_one_id === user.id
                            ? c.user_two_id
                            : c.user_one_id;

                    return (
                        <div
                            key={i}
                            style={styles.chatItem}
                            onClick={() => loadMessages(otherUser)}
                        >
                            User {otherUser}
                            <p style={{ fontSize: 12 }}>
                                {c.last_message}
                            </p>
                        </div>
                    );

                })}
            </div>

            {/* CHAT AREA */}
            <div style={styles.chatBox}>

                {selectedUser ? (
                    <>
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

                            {/* AUTO SCROLL TARGET */}
                            <div ref={messagesEndRef} />

                        </div>

                        {/* TYPING */}
                        {isTyping && (
                            <p style={{ color: "#94a3b8", fontSize: 12 }}>
                                User {typingUser} is typing...
                            </p>
                        )}

                        <div style={styles.inputBox}>
                            <input
                                value={text}
                                onChange={handleTyping}
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
