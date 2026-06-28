import { useNavigate } from "react-router-dom";

function ChatHeader({ user, selectedUser, onlineUsers = [] }) {

    const navigate = useNavigate();

    if (!selectedUser) return null;

    const isOnline = onlineUsers.includes(selectedUser.id);

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        socket?.disconnect?.();

        navigate("/login", { replace: true });

    };

    return (

        <div style={styles.header}>

            <div style={styles.left}>

                <div style={styles.avatar}>
                    {selectedUser.username?.charAt(0).toUpperCase()}
                </div>

                <div>

                    <div style={styles.name}>
                        {selectedUser.username}
                    </div>

                    <div style={styles.status}>
                        {isOnline ? "🟢 Online" : "⚫ Offline"}
                    </div>

                </div>

            </div>

            <div style={styles.right}>

                <button
                    style={styles.logoutButton}
                    onClick={logout}
                >
                    Logout
                </button>

            </div>

        </div>

    );

}

const styles = {

    header: {
        height: "65px",
        background: "#1e293b",
        borderBottom: "1px solid #334155",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 20px"
    },

    left: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },

    avatar: {
        width: "45px",
        height: "45px",
        borderRadius: "50%",
        background: "#3b82f6",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
        fontSize: "18px",
        fontWeight: "bold"
    },

    name: {
        color: "#fff",
        fontSize: "17px",
        fontWeight: "600"
    },

    status: {
        color: "#94a3b8",
        fontSize: "13px",
        marginTop: "2px"
    },

    right: {
        display: "flex",
        alignItems: "center",
        gap: "10px"
    },

    logoutButton: {
        background: "#ef4444",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "10px 18px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "14px",
        transition: "0.2s"
    }

};

export default ChatHeader;
