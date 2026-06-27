import { useEffect, useState } from "react";
import API from "../services/api";

function Chat() {

    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    /*
    ==========================================
    Load Conversations
    ==========================================
    */

    const loadConversations = async () => {

        try {

            const res = await API.get("/conversations", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setConversations(res.data.conversations);

        }

        catch (err) {

            console.error(err);

        }

    };

    /*
    ==========================================
    Load Messages
    ==========================================
    */

    const loadMessages = async (userId) => {

        try {

            const res = await API.get(`/chat/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setMessages(res.data.messages);
            setSelectedUser(userId);

        }

        catch (err) {

            console.error(err);

        }

    };

    /*
    ==========================================
    Send Message
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
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessages([...messages, res.data.data]);
            setText("");

        }

        catch (err) {

            console.error(err);

        }

    };

    useEffect(() => {
        loadConversations();
    }, []);

    return (

        <div style={styles.container}>

            {/* LEFT SIDEBAR */}
            <div style={styles.sidebar}>

                <h3 style={{ color: "white" }}>Chats</h3>

                {conversations.map((c, index) => {

                    const otherUser =
                        c.user_one_id === user.id
                            ? c.user_two_id
                            : c.user_one_id;

                    return (

                        <div
                            key={index}
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

            {/* CHAT WINDOW */}
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
        cursor: "pointer",
        borderRadius: "5px"
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
        gap: "10px",
        marginTop: "10px"
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
        border: "none",
        color: "white",
        borderRadius: "5px",
        cursor: "pointer"
    }

};

export default Chat;
