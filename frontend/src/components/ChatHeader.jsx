function ChatHeader({ user, selectedUser, onlineUsers = [] }) {

    if (!selectedUser) return null;

    const isOnline = onlineUsers.includes(selectedUser.id);

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
                {/* Future buttons */}
                <button style={styles.icon}>⋮</button>
            </div>

        </div>

    );

}

const styles = {

    header: {
        height: "60px",
        background: "#1e293b",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 15px",
        borderBottom: "1px solid #334155"
    },

    left: {
        display: "flex",
        alignItems: "center",
        gap: "10px"
    },

    avatar: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        background: "#3b82f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "bold"
    },

    name: {
        color: "white",
        fontWeight: "bold"
    },

    status: {
        fontSize: "12px",
        color: "#94a3b8"
    },

    right: {
        color: "white"
    },

    icon: {
        background: "transparent",
        border: "none",
        color: "white",
        fontSize: "20px",
        cursor: "pointer"
    }

};

export default ChatHeader;
