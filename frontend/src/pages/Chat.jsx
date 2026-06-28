// frontend/src/pages/Chat.jsx - COMPLETE FIXED VERSION
import { useEffect, useState, useRef, useCallback } from "react";
import { 
  FaSearch, FaUserPlus, FaPaperPlane, 
  FaImage, FaSmile, FaTimes, FaUser,
  FaReply, FaEllipsisV, FaTrash, FaEdit
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
  const [isConnected, setIsConnected] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketConnected = useRef(false);
  const inputRef = useRef(null);
  
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
  const loadConversations = useCallback(async () => {
    try {
      const res = await API.get("/conversations");
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error("Error loading conversations:", err);
    }
  }, []);

  // ✅ FIXED: Load messages - sets selectedUser correctly
  const loadMessages = useCallback(async (otherUser) => {
    if (!otherUser || !otherUser.id) {
      console.error("Invalid user:", otherUser);
      return;
    }

    try {
      setLoading(true);
      console.log("Loading messages for user:", otherUser);
      
      // Set selected user FIRST so the chat interface shows
      setSelectedUser(otherUser);
      
      const res = await API.get(`/chat/${otherUser.id}`);
      console.log("Messages response:", res.data);
      
      setMessages(res.data.messages || []);
      
      // Join conversation room for socket
      socket.emit("join-conversation", otherUser.id);
      
    } catch (err) {
      console.error("Error loading messages:", err);
      // Even if messages fail, keep the user selected
      setSelectedUser(otherUser);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search users
  const searchUsers = useCallback(async (query) => {
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
  }, []);

  // Start conversation
  const startConversation = useCallback(async (otherUser) => {
    try {
      console.log("Starting conversation with:", otherUser);
      
      const res = await API.post("/conversations", { userId: otherUser.id });
      console.log("Conversation response:", res.data);
      
      if (res.data.success) {
        await loadConversations();
        // ✅ Use loadMessages to set the user
        await loadMessages(otherUser);
        setShowSearch(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Error starting conversation:", err);
      // ✅ Even if API fails, try to load messages
      await loadMessages(otherUser);
    }
  }, [loadConversations, loadMessages]);

  // ✅ FIXED: Send message with reply support
  const sendMessage = useCallback(async () => {
    if (!text.trim() || !selectedUser) {
      console.log("Cannot send: no text or no selected user");
      return;
    }

    console.log("Sending message to:", selectedUser.id, "text:", text);

    try {
      const payload = {
        receiver_id: selectedUser.id,
        message: text
      };

      if (replyTo) {
        payload.reply_to_message_id = replyTo.id;
        console.log("Replying to message:", replyTo.id);
      }

      const res = await API.post("/chat/send", payload);

      console.log("Message sent response:", res.data);

      const newMessage = res.data.data;
      
      setMessages((prev) => {
        const exists = prev.find(m => m.id === newMessage.id);
        if (exists) return prev;
        return [...prev, newMessage];
      });

      const socketMessage = {
        ...newMessage,
        conversation_id: selectedUser.id
      };
      
      if (socketConnected.current) {
        socket.emit("send-message", socketMessage);
      }
      
      setText("");
      setTyping(false);
      setReplyTo(null);
      
      await loadConversations();
      setTimeout(scrollToBottom, 100);
      
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. Please try again.");
    }
  }, [text, selectedUser, replyTo, loadConversations]);

  // Handle reply
  const handleReply = (message) => {
    setReplyTo({
      id: message.id,
      message: message.message,
      sender: message.sender_name || message.sender_username || 'User',
      sender_id: message.sender_id
    });
    inputRef.current?.focus();
  };

  // Cancel reply
  const cancelReply = () => {
    setReplyTo(null);
  };

  // Handle typing
  const handleTyping = useCallback((e) => {
    setText(e.target.value);
    
    if (!typing && e.target.value.trim() && selectedUser) {
      setTyping(true);
      socket.emit("typing", {
        conversationId: selectedUser.id,
        userId: user.id
      });
    }
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      socket.emit("stop-typing", {
        conversationId: selectedUser?.id,
        userId: user.id
      });
    }, 2000);
  }, [typing, selectedUser, user.id]);

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
    socketConnected.current = true;

    socket.emit("user-online", user.id);

    const onConnect = () => {
      console.log("✅ Socket connected:", socket.id);
      setIsConnected(true);
      socketConnected.current = true;
      socket.emit("user-online", user.id);
    };

    const onReceiveMessage = (message) => {
      console.log("📥 Received message via socket:", message);
      setMessages((prev) => {
        const exists = prev.find(m => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
      loadConversations();
      setTimeout(scrollToBottom, 100);
    };

    const onOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    const onUserTyping = (data) => {
      if (data.userId !== user.id) {
        setIsTyping(true);
      }
    };

    const onUserStopTyping = (data) => {
      if (data.userId !== user.id) {
        setIsTyping(false);
      }
    };

    socket.on("connect", onConnect);
    socket.on("receive-message", onReceiveMessage);
    socket.on("online-users", onOnlineUsers);
    socket.on("user-typing", onUserTyping);
    socket.on("user-stop-typing", onUserStopTyping);

    return () => {
      socket.off("connect", onConnect);
      socket.off("receive-message", onReceiveMessage);
      socket.off("online-users", onOnlineUsers);
      socket.off("user-typing", onUserTyping);
      socket.off("user-stop-typing", onUserStopTyping);
      socket.disconnect();
      socketConnected.current = false;
    };
  }, [user.id, loadConversations]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    socket.disconnect();
    socketConnected.current = false;
    window.location.href = "/login";
  };

  const isAdmin = user?.role === 'admin';

  // Debug logging
  console.log("Current state:", {
    selectedUser: selectedUser?.username || 'none',
    messagesCount: messages.length,
    conversationsCount: conversations.length,
    isConnected
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
                {isConnected ? '🟢 Online' : '⚫ Offline'}
              </span>
            </div>
          </div>
          
          // In Chat.jsx, inside the sidebar-actions div, add the profile button:

<div className="sidebar-actions">
    {/* ✅ Profile Button - Add this */}
    <button 
        className="btn btn-secondary btn-sm"
        onClick={() => window.location.href = '/profile'}
        title="Profile"
    >
        <FaUser />
    </button>
    
    {isAdmin && (
        <button 
            className="btn btn-primary btn-sm"
            onClick={() => window.location.href = '/admin'}
            style={{ marginRight: '4px' }}
        >
            ⚙️ Admin
        </button>
    )}
    
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

      {/* Chat Area - THIS IS WHERE THE MESSAGING INTERFACE SHOWS */}
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
                setReplyTo(null);
              }}
            />

            {/* Reply Preview Bar */}
            {replyTo && (
              <div className="reply-preview">
                <div className="reply-preview-content">
                  <FaReply className="reply-preview-icon" />
                  <div className="reply-preview-info">
                    <span className="reply-preview-sender">
                      Replying to {replyTo.sender}
                    </span>
                    <span className="reply-preview-text">{replyTo.message}</span>
                  </div>
                </div>
                <button className="reply-preview-close" onClick={cancelReply}>
                  <FaTimes />
                </button>
              </div>
            )}

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
                          {/* Reply Preview in Message */}
                          {m.reply_to_message_id && (
                            <div className="message-reply-preview">
                              <FaReply className="reply-icon" />
                              <span className="reply-sender">
                                {m.reply_to_sender_name || m.reply_to_username || 'User'}
                              </span>
                              <span className="reply-text">{m.reply_to_message}</span>
                            </div>
                          )}
                          
                          <div className="message-text">{m.message}</div>
                          
                          <div className="message-footer">
                            <div className="message-time">
                              {new Date(m.created_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                            
                            {/* Message Actions */}
                            <div className="message-actions">
                              <button 
                                className="message-action-btn"
                                onClick={() => handleReply(m)}
                                title="Reply"
                              >
                                <FaReply />
                              </button>
                              {m.sender_id === user.id && (
                                <>
                                  <button 
                                    className="message-action-btn"
                                    title="Edit"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button 
                                    className="message-action-btn"
                                    title="Delete"
                                  >
                                    <FaTrash />
                                  </button>
                                </>
                              )}
                            </div>
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

            {/* ✅ THIS IS THE INPUT - Make sure it's always visible when user is selected */}
            <div className="chat-input-container">
              <button className="input-action">
                <FaImage />
              </button>
              <button className="input-action">
                <FaSmile />
              </button>
              <input
                ref={inputRef}
                value={text}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                placeholder={replyTo ? `Reply to ${replyTo.sender}...` : `Message ${selectedUser.full_name}...`}
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
