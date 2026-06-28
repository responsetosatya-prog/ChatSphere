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
      const res = await API.get(`/chat/${otherUser.id}`);
      
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
      const res = await API.post("/conversations", { userId: otherUser.id });
      
      if (res.data.success) {
        await loadConversations();
        await loadMessages(otherUser);
        setShowSearch(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Error starting conversation:", err);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!text.trim() || !selectedUser) return;

    try {
      const res = await API.post("/chat/send", {
        receiver_id: selectedUser.id,
        message: text
      });

      const newMessage = res.data.data;
      
      setMessages((prev) => {
        const exists = prev.find(m => m.id === newMessage.id);
        if (exists) return prev;
        return [...prev, newMessage];
      });

      socket.emit("send-message", {
        ...newMessage,
        conversationId: selectedConversation
      });
      
      setText("");
      setTyping(false);
      
      // Update conversation list
      await loadConversations();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Handle typing
  const handleTyping = (e) => {
    setText(e.target.value);
    
    if (!typing) {
      setTyping(true);
      socket.emit("typing", {
        conversationId: selectedConversation,
        userId: user.id
      });
    }
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      socket.emit("stop-typing", {
        conversationId: selectedConversation,
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
    },
