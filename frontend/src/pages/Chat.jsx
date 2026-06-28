// frontend/src/pages/Chat.jsx
import { useEffect, useState, useRef } from "react";
import { 
  FaSearch, FaUserPlus, FaPaperPlane, 
  FaImage, FaSmile, FaTimes, FaUser 
} from "react-icons/fa";
import API from "../services/api";
import socket from "../socket/socket";
import ChatHeader from "../components/ChatHeader";

function Chat() {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  if (!user) {
    return (
      <div className="chat-error">
        <h2>User not found. Please log in again.</h2>
      </div>
    );
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations
  const loadConversations = async () => {
    try {
      const res = await API.get("/conversations");
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error("Error loading conversations:", err);
    }
  };

  // Load messages
  const loadMessages = async (otherUser) => {
    try {
      setLoading(true);
      console.log("Loading messages for user:", otherUser);
      
      const res = await API.get(`/chat/${otherUser.id}`);
      console.log("Messages response:", res.data);
      
      const unique = Array.from(
        new Map(res.data.messages.map(m => [m.id, m])).values()
      );
      
      setMessages(unique);
      setSelectedUser(otherUser);
      setSelectedConversation(otherUser.id);
      
      socket.emit("join-conversation", otherUser.id);
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setLoading(false);
    }
  };

  // Search users
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const res = await API.get(`/users?search=${encodeURIComponent(query)}`);
      setSearchResults(res.data.users || []);
    } catch (err) {
      console.error("Error searching users:", err);
    }
  };

  // Start conversation
  const startConversation = async (otherUser) => {
    try {
      console.log("Starting conversation with:", otherUser);
      
      const res = await API.post("/conversations", { userId: otherUser.id });
      console.log("Conversation response:", res.data);
      
      if (res.data.success) {
        await loadConversations();
        await loadMessages(otherUser);
        setShowSearch(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Error starting conversation:", err);
      // If error, try to load messages anyway
      await loadMessages(otherUser);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!text.trim() || !selectedUser) {
      console.log("Cannot send: no text or no selected user");
      return;
    }

    console.log("Sending message to:", selectedUser.id, "text:", text);

    try {
      const res = await API.post("/chat/send", {
        receiver_id: selectedUser.id,
        message: text
      });

      console.log("Message sent response:", res.data);

      const newMessage = res.data.data;
      
      setMessages((prev) => {
        const exists = prev.find(m => m.id === newMessage.id);
        if (exists) return prev;
        return [...prev, newMessage];
      });

      socket.emit("send-message", {
        ...newMessage,
        conversationId: selectedConversation || selectedUser.id
      });
      
      setText("");
      setTyping(false);
      
      // Update conversation list
      await loadConversations();
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. Please try again.");
    }
  };

  // Handle typing
  const handleTyping = (e) => {
    setText(e.target.value);
    
    if (!typing && e.target.value.trim()) {
      setTyping(true);
      socket.emit("typing", {
        conversationId: selectedConversation || selectedUser?.id,
        userId: user.id
      });
    }
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      socket.emit("stop-typing", {
        conversationId: selectedConversation || selectedUser?.id,
        userId: user.id
      });
    }, 2000);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Socket events
  useEffect(() => {
    socket.connect();
    socket.emit("user-online", user.id);

    socket.on("receive-message", (message) => {
      console.log("Received message:", message);
      setMessages((prev) => {
        const exists = prev.find(m => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
      loadConversations();
    });

    socket.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("user-typing", (data) => {
      if (data.userId !== user.id) {
        setIsTyping(true);
      }
    });

    socket.on("user-stop-typing", (data) => {
      if (data.userId !== user.id) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.off("receive-message");
      socket.off("online-users");
      socket.off("user-typing");
      socket.off("user-stop-typing");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    loadConversations();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    socket.disconnect();
    window.location.href = "/login";
  };

  // Log for debugging
  console.log("Current state:", {
    selectedUser,
    hasMessages: messages.length > 0,
    conversations: conversations.length
  });

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-user">
            <div className="avatar">
              {user.full_name?.charAt(0) || <FaUser />}
            </div>
            <div className="sidebar-user-info">
              <h3>{user.full_name}</h3>
              <span className="user-status">
                {onlineUsers.includes(user.id) ? '🟢 Online' : '⚫ Offline'}
              </span>
            </div>
          </div>
          
          <div className="sidebar-actions">
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => setShowSearch(!showSearch)}
            >
              <FaUserPlus />
            </button>
            <button className="btn btn-danger btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        {/* Search */}
        {showSearch && (
          <div className="search-container animate-slide-in">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search for users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                autoFocus
              />
              <button 
                className="search-close" 
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                <FaTimes />
              </button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((result) => (
                  <div 
                    key={result.id}
                    className="search-result-item"
                    onClick={() => startConversation(result)}
                  >
                    <div className="avatar avatar-sm">
                      {result.username?.charAt(0) || <FaUser />}
                    </div>
                    <div>
                      <div className="search-result-name">{result.full_name}</div>
                      <div className="search-result-username">@{result.username}</div>
                    </div>
                    <button className="btn btn-primary btn-sm">
                      <FaUserPlus />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Conversations */}
        <div className="conversations-list">
          {conversations.length === 0 ? (
            <div className="empty-conversations">
              <p>No conversations yet</p>
              <p className="empty-sub">Search for users to start chatting</p>
            </div>
          ) : (
            conversations.map((c) => {
              const otherUser = c.user_one.id === user.id 
                ? c.user_two 
                : c.user_one;
              
              const isOnline = onlineUsers.includes(otherUser.id);
              const isActive = selectedUser?.id === otherUser.id;
              
              return (
                <div
                  key={c.id}
                  className={`conversation-item ${isActive ? 'active' : ''}`}
                  onClick={() => loadMessages(otherUser)}
                >
                  <div className={`avatar avatar-sm ${isOnline ? 'online' : ''}`}>
                    {otherUser.username?.charAt(0) || <FaUser />}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-name">{otherUser.full_name}</div>
                    <div className="conversation-last-message">
                      {c.last_message || "No messages yet"}
                    </div>
                  </div>
                  {isOnline && <div className="online-dot"></div>}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {selectedUser ? (
          <>
            <ChatHeader
              user={user}
              selectedUser={selectedUser}
              onlineUsers={onlineUsers}
              onBack={() => {
                setSelectedUser(null);
                setMessages([]);
              }}
            />

            <div className="messages-container">
              {loading ? (
                <div className="loading-messages">
                  <div className="loading-spinner"></div>
                </div>
              ) : (
                <>
                  {messages.length === 0 ? (
                    <div className="empty-messages">
                      <p>No messages yet. Say hello! 👋</p>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`message ${m.sender_id === user.id ? 'sent' : 'received'}`}
                      >
                        {m.sender_id !== user.id && (
                          <div className="message-avatar avatar avatar-sm">
                            {selectedUser.username?.charAt(0) || <FaUser />}
                          </div>
                        )}
                        <div className="message-content">
                          <div className="message-text">{m.message}</div>
                          <div className="message-time">
                            {new Date(m.created_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {isTyping && (
                    <div className="typing-indicator">
                      <span>{selectedUser.username} is typing</span>
                      <span className="typing-dots">...</span>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* THIS IS THE INPUT BOX - Make sure it's always visible when user is selected */}
            <div className="chat-input-container">
              <button className="input-action">
                <FaImage />
              </button>
              <button className="input-action">
                <FaSmile />
              </button>
              <input
                value={text}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${selectedUser.full_name}...`}
                className="chat-input"
                autoFocus
              />
              <button 
                className="btn btn-primary" 
                onClick={sendMessage}
                disabled={!text.trim()}
              >
                <FaPaperPlane />
              </button>
            </div>
          </>
        ) : (
          <div className="empty-chat">
            <div className="empty-chat-content">
              <div className="empty-chat-icon">💬</div>
              <h2>Welcome to ChatSphere</h2>
              <p>Select a conversation or search for users to start chatting</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowSearch(true)}
              >
                <FaUserPlus /> Find Friends
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
