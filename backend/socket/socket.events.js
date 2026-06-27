const SOCKET_EVENTS = {

    CONNECTION: "connection",
    DISCONNECT: "disconnect",

    // User status
    USER_ONLINE: "user-online",
    ONLINE_USERS: "online-users",

    // Conversations
    JOIN_CONVERSATION: "join-conversation",

    // Messages
    SEND_MESSAGE: "send-message",
    RECEIVE_MESSAGE: "receive-message",

    // Typing
    TYPING: "typing",
    STOP_TYPING: "stop-typing",
    USER_TYPING: "user-typing",
    USER_STOP_TYPING: "user-stop-typing",

    // Seen / read receipts
    MESSAGES_SEEN: "messages-seen",

};

export default SOCKET_EVENTS;
