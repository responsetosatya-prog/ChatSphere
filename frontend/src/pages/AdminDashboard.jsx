// frontend/src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { FaUsers, FaUserCheck, FaUserTimes, FaEnvelope, FaTrash, FaChartLine, FaClock } from "react-icons/fa";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "admin") {
      navigate("/chat");
      return;
    }
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
      setRecentActivity(statsRes.data.recentActivity || []);
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
      console.error("Error approving user:", err);
      alert("Failed to approve user");
    }
  };

  const blockUser = async (id) => {
    try {
      await API.put(`/admin/users/${id}/block`);
      await loadDashboard();
    } catch (err) {
      console.error("Error blocking user:", err);
      alert("Failed to block user");
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/admin/users/${id}`);
      await loadDashboard();
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Admin Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-logo">💬 ChatSphere</div>
        <div className="admin-user">
          <div className="avatar">
            {JSON.parse(localStorage.getItem("user") || "{}").full_name?.charAt(0) || 'A'}
          </div>
          <div>
            <div className="admin-user-name">
              {JSON.parse(localStorage.getItem("user") || "{}").full_name}
            </div>
            <div className="admin-user-role">Administrator</div>
          </div>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <FaChartLine /> <span>Dashboard</span>
          </button>
          <button 
            className={`admin-nav-item ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <FaUsers /> <span>Users</span>
          </button>
          <button 
            className="admin-nav-item logout"
            onClick={logout}
          >
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Admin Content */}
      <div className="admin-content">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <div className="admin-header-actions">
            <button className="btn btn-secondary btn-sm" onClick={loadDashboard}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {activeTab === "dashboard" && (
          <>
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: "rgba(108, 99, 255, 0.1)" }}>
                  <FaUsers style={{ color: "#6C63FF" }} />
                </div>
                <div>
                  <div className="stat-value">{stats?.totalUsers || 0}</div>
                  <div className="stat-label">Total Users</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon" style={{ background: "rgba(68, 221, 136, 0.1)" }}>
                  <FaUserCheck style={{ color: "#44DD88" }} />
                </div>
                <div>
                  <div className="stat-value">{stats?.approvedUsers || 0}</div>
                  <div className="stat-label">Approved Users</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon" style={{ background: "rgba(255, 193, 7, 0.1)" }}>
                  <FaUserTimes style={{ color: "#FFC107" }} />
                </div>
                <div>
                  <div className="stat-value">{stats?.pendingUsers || 0}</div>
                  <div className="stat-label">Pending Approval</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon" style={{ background: "rgba(255, 68, 68, 0.1)" }}>
                  <FaEnvelope style={{ color: "#FF4444" }} />
                </div>
                <div>
                  <div className="stat-value">{stats?.totalMessages || 0}</div>
                  <div className="stat-label">Total Messages</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="admin-card">
              <h3>
                <FaClock style={{ marginRight: "10px" }} />
                Recent Activity
              </h3>
              <div className="activity-list">
                {recentActivity.length === 0 ? (
                  <p className="no-activity">No recent activity</p>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-avatar">
                        {activity.full_name?.charAt(0) || 'U'}
                      </div>
                      <div className="activity-info">
                        <div className="activity-user">{activity.full_name}</div>
                        <div className="activity-detail">
                          @{activity.username} • Status: 
                          <span className={`badge badge-${activity.status}`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                      <div className="activity-time">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "users" && (
          <div className="admin-card">
            <div className="users-header">
              <h3>All Users</h3>
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
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <div className="avatar avatar-sm">
                            {user.full_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="user-cell-name">{user.full_name}</div>
                            <div className="user-cell-username">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge badge-${user.role === 'admin' ? 'info' : 'secondary'}`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${user.status}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="user-actions">
                          {user.status === 'pending' && (
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => approveUser(user.id)}
                            >
                              ✅ Approve
                            </button>
                          )}
                          {user.status === 'approved' && user.role !== 'admin' && (
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => blockUser(user.id)}
                            >
                              🚫 Block
                            </button>
                          )}
                          {user.status === 'blocked' && (
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => approveUser(user.id)}
                            >
                              🔓 Unblock
                            </button>
                          )}
                          {user.role !== 'admin' && (
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => deleteUser(user.id)}
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
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
