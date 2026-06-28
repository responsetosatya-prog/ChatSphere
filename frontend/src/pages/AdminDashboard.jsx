import { useState, useEffect } from "react";
import {
    FaUsers, FaUserCheck, FaUserTimes, FaEnvelope,
    FaTrash, FaChartLine, FaClock, FaShieldAlt,
    FaSearch, FaCheckCircle, FaBan, FaUserPlus
} from "react-icons/fa";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        if (user.role !== "admin") { navigate("/chat"); return; }
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const [statsRes, usersRes] = await Promise.all([
                API.get("/admin/dashboard"),
                API.get("/admin/users")
            ]);
            setStats(statsRes.data.statistics);
            setUsers(usersRes.data.users);
        } catch (err) {
            console.error("Error loading dashboard:", err);
        } finally {
            setLoading(false);
        }
    };

    const approveUser = async (id) => {
        try {
            await API.put(`/admin/users/${id}/approve`);
            await loadDashboard();
        } catch (err) {
            console.error(err);
            alert("Failed to approve user");
        }
    };

    const blockUser = async (id) => {
        try {
            await API.put(`/admin/users/${id}/block`);
            await loadDashboard();
        } catch (err) {
            console.error(err);
            alert("Failed to block user");
        }
    };

    const deleteUser = async (id) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            await API.delete(`/admin/users/${id}`);
            await loadDashboard();
        } catch (err) {
            console.error(err);
            alert("Failed to delete user");
        }
    };

    const makeAdmin = async (id) => {
        try {
            await API.put(`/admin/users/${id}/role`, { role: 'admin' });
            await loadDashboard();
        } catch (err) {
            console.error(err);
            alert("Failed to update user role");
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "all" || u.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-sidebar">
                <div className="admin-logo">💬 ChatSphere</div>
                <div className="admin-user-profile">
                    <div className="admin-avatar">{user.full_name?.charAt(0) || 'A'}</div>
                    <div className="admin-user-info">
                        <div className="admin-user-name">{user.full_name}</div>
                        <div className="admin-user-role">Administrator</div>
                    </div>
                </div>
                <nav className="admin-nav">
                    <button className={`admin-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
                        onClick={() => setActiveTab("dashboard")}>
                        <FaChartLine /> Dashboard
                    </button>
                    <button className={`admin-nav-item ${activeTab === "users" ? "active" : ""}`}
                        onClick={() => setActiveTab("users")}>
                        <FaUsers /> Users
                    </button>
                    <button className="admin-nav-item logout" onClick={logout}>
                        <FaShieldAlt /> Logout
                    </button>
                </nav>
            </div>

            <div className="admin-main">
                <div className="admin-header">
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p className="admin-subtitle">Manage your ChatSphere community</p>
                    </div>
                    <button className="btn btn-secondary" onClick={loadDashboard}>🔄 Refresh</button>
                </div>

                {activeTab === "dashboard" && (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: "rgba(108,99,255,0.15)" }}>
                                    <FaUsers style={{ color: "#6C63FF" }} />
                                </div>
                                <div>
                                    <div className="stat-value">{stats?.totalUsers || 0}</div>
                                    <div className="stat-label">Total Users</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: "rgba(68,221,136,0.15)" }}>
                                    <FaUserCheck style={{ color: "#44DD88" }} />
                                </div>
                                <div>
                                    <div className="stat-value">{stats?.approvedUsers || 0}</div>
                                    <div className="stat-label">Active Users</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: "rgba(255,193,7,0.15)" }}>
                                    <FaUserTimes style={{ color: "#FFC107" }} />
                                </div>
                                <div>
                                    <div className="stat-value">{stats?.pendingUsers || 0}</div>
                                    <div className="stat-label">Pending Approval</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: "rgba(255,68,68,0.15)" }}>
                                    <FaEnvelope style={{ color: "#FF4444" }} />
                                </div>
                                <div>
                                    <div className="stat-value">{stats?.totalMessages || 0}</div>
                                    <div className="stat-label">Total Messages</div>
                                </div>
                            </div>
                        </div>

                        <div className="admin-card">
                            <h3>⚡ Quick Actions</h3>
                            <div className="quick-actions">
                                <button className="btn btn-primary" onClick={() => setActiveTab("users")}>
                                    <FaUserPlus /> Manage Users
                                </button>
                                {stats?.pendingUsers > 0 && (
                                    <button className="btn btn-success" onClick={() => {
                                        users.filter(u => u.status === 'pending').forEach(u => approveUser(u.id));
                                    }}>
                                        <FaCheckCircle /> Approve All Pending ({stats.pendingUsers})
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "users" && (
                    <div className="admin-card users-section">
                        <div className="users-header">
                            <h3>👥 User Management</h3>
                            <div className="users-controls">
                                <div className="search-wrapper">
                                    <FaSearch className="search-icon" />
                                    <input type="text" placeholder="Search users..." value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
                                </div>
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="blocked">Blocked</option>
                                </select>
                                <span className="users-count">{filteredUsers.length} users</span>
                            </div>
                        </div>
                        <div className="users-table-container">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length === 0 ? (
                                        <tr><td colSpan="6" className="no-users">No users found</td></tr>
                                    ) : (
                                        filteredUsers.map((u) => (
                                            <tr key={u.id}>
                                                <td>
                                                    <div className="user-cell">
                                                        <div className="avatar avatar-sm">{u.full_name?.charAt(0) || 'U'}</div>
                                                        <div>
                                                            <div className="user-cell-name">{u.full_name}</div>
                                                            <div className="user-cell-username">@{u.username}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{u.email}</td>
                                                <td>
                                                    <span className={`badge badge-${u.role === 'admin' ? 'info' : 'secondary'}`}>
                                                        {u.role || 'user'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge badge-${u.status}`}>
                                                        {u.status === 'pending' && '⏳ Pending'}
                                                        {u.status === 'approved' && '✅ Approved'}
                                                        {u.status === 'blocked' && '🚫 Blocked'}
                                                    </span>
                                                </td>
                                                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <div className="user-actions">
                                                        {u.status === 'pending' && (
                                                            <button className="btn btn-success btn-sm" onClick={() => approveUser(u.id)} title="Approve">✅</button>
                                                        )}
                                                        {u.status === 'approved' && u.role !== 'admin' && (
                                                            <>
                                                                <button className="btn btn-danger btn-sm" onClick={() => blockUser(u.id)} title="Block">🚫</button>
                                                                <button className="btn btn-info btn-sm" onClick={() => makeAdmin(u.id)} title="Make Admin">👑</button>
                                                            </>
                                                        )}
                                                        {u.status === 'blocked' && (
                                                            <button className="btn btn-success btn-sm" onClick={() => approveUser(u.id)} title="Unblock">🔓</button>
                                                        )}
                                                        {u.role !== 'admin' && (
                                                            <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)} title="Delete"><FaTrash /></button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
