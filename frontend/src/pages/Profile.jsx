import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser, FaEnvelope, FaLock, FaCamera, FaEdit,
    FaSave, FaTimes, FaArrowLeft, FaMapMarkerAlt,
    FaGlobe, FaCheckCircle, FaExclamationCircle
} from "react-icons/fa";
import API from "../services/api";

function Profile() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [profile, setProfile] = useState({
        full_name: '', username: '', email: '', bio: '',
        location: '', website: '', profile_picture: '', created_at: '', role: ''
    });
    const [formData, setFormData] = useState({
        full_name: '', username: '', email: '', bio: '', location: '', website: ''
    });
    const [passwordData, setPasswordData] = useState({
        current_password: '', new_password: '', confirm_password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => { loadProfile(); }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const res = await API.get("/profile/me");
            if (res.data.success) {
                const user = res.data.user;
                setProfile(user);
                setFormData({
                    full_name: user.full_name || '',
                    username: user.username || '',
                    email: user.email || '',
                    bio: user.bio || '',
                    location: user.location || '',
                    website: user.website || ''
                });
            }
        } catch (err) {
            console.error(err);
            setMessage({ text: "Failed to load profile", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });
        try {
            const res = await API.put("/profile/update", formData);
            if (res.data.success) {
                setProfile(res.data.user);
                setIsEditing(false);
                setMessage({ text: "Profile updated successfully!", type: "success" });
                const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
                localStorage.setItem("user", JSON.stringify({ ...storedUser, ...res.data.user }));
                setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            }
        } catch (err) {
            setMessage({ text: err.response?.data?.message || "Failed to update profile", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleUploadPicture = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setMessage({ text: "Please select an image file", type: "error" });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ text: "Image must be less than 5MB", type: "error" });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setSaving(true);
            const uploadRes = await API.post("/upload", formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (uploadRes.data.success) {
                const imageUrl = uploadRes.data.file.url;
                const updateRes = await API.put("/profile/picture", { profile_picture: imageUrl });
                if (updateRes.data.success) {
                    setProfile(updateRes.data.user);
                    setMessage({ text: "Profile picture updated!", type: "success" });
                    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
                    localStorage.setItem("user", JSON.stringify({ ...storedUser, profile_picture: imageUrl }));
                    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
                }
            }
        } catch (err) {
            setMessage({ text: "Failed to upload picture", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            setMessage({ text: "Passwords do not match", type: "error" });
            return;
        }
        if (passwordData.new_password.length < 6) {
            setMessage({ text: "Password must be at least 6 characters", type: "error" });
            return;
        }

        setPasswordLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const res = await API.put("/profile/password", {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });
            if (res.data.success) {
                setMessage({ text: "Password changed successfully!", type: "success" });
                setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
                setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            }
        } catch (err) {
            setMessage({ text: err.response?.data?.message || "Failed to change password", type: "error" });
        } finally {
            setPasswordLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <button className="profile-back" onClick={() => navigate('/chat')}>
                    <FaArrowLeft /> Back to Chat
                </button>
                <h1>Profile</h1>
                <div className="profile-header-actions">
                    {!isEditing ? (
                        <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                            <FaEdit /> Edit Profile
                        </button>
                    ) : (
                        <button className="btn btn-secondary" onClick={() => {
                            setIsEditing(false);
                            setFormData({
                                full_name: profile.full_name || '',
                                username: profile.username || '',
                                email: profile.email || '',
                                bio: profile.bio || '',
                                location: profile.location || '',
                                website: profile.website || ''
                            });
                            setMessage({ text: '', type: '' });
                        }}>
                            <FaTimes /> Cancel
                        </button>
                    )}
                </div>
            </div>

            {message.text && (
                <div className={`profile-message ${message.type}`}>
                    {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
                    {message.text}
                </div>
            )}

            <div className="profile-content">
                <div className="profile-picture-section">
                    <div className="profile-picture-wrapper">
                        <img
                            src={profile.profile_picture || `https://ui-avatars.com/api/?name=${profile.full_name}&background=6C63FF&color=fff&size=150`}
                            alt={profile.full_name}
                            className="profile-picture"
                        />
                        <button className="profile-picture-upload" onClick={() => fileInputRef.current?.click()} disabled={saving}>
                            <FaCamera />
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUploadPicture} style={{ display: 'none' }} />
                    </div>
                    <div className="profile-name-display">
                        <h2>{profile.full_name}</h2>
                        <span className="profile-username">@{profile.username}</span>
                        {profile.role === 'admin' && <span className="profile-badge">Admin</span>}
                    </div>
                </div>

                <div className="profile-info-card">
                    {isEditing ? (
                        <form onSubmit={handleUpdateProfile} className="profile-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Username</label>
                                <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Bio</label>
                                <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell us about yourself..." rows="3" />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="City, Country" />
                            </div>
                            <div className="form-group">
                                <label>Website</label>
                                <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://yourwebsite.com" />
                            </div>
                            <div className="profile-form-actions">
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : <><FaSave /> Save Changes</>}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="profile-details">
                            <div className="profile-detail-item">
                                <span className="detail-label">Full Name</span>
                                <span className="detail-value">{profile.full_name}</span>
                            </div>
                            <div className="profile-detail-item">
                                <span className="detail-label">Username</span>
                                <span className="detail-value">@{profile.username}</span>
                            </div>
                            <div className="profile-detail-item">
                                <span className="detail-label">Email</span>
                                <span className="detail-value">{profile.email}</span>
                            </div>
                            {profile.bio && (
                                <div className="profile-detail-item">
                                    <span className="detail-label">Bio</span>
                                    <span className="detail-value bio-text">{profile.bio}</span>
                                </div>
                            )}
                            {profile.location && (
                                <div className="profile-detail-item">
                                    <span className="detail-label">Location</span>
                                    <span className="detail-value"><FaMapMarkerAlt /> {profile.location}</span>
                                </div>
                            )}
                            {profile.website && (
                                <div className="profile-detail-item">
                                    <span className="detail-label">Website</span>
                                    <span className="detail-value">
                                        <a href={profile.website} target="_blank" rel="noopener noreferrer">{profile.website}</a>
                                    </span>
                                </div>
                            )}
                            <div className="profile-detail-item">
                                <span className="detail-label">Member Since</span>
                                <span className="detail-value">{formatDate(profile.created_at)}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="profile-password-card">
                    <h3>Change Password</h3>
                    <form onSubmit={handleChangePassword} className="password-form">
                        <div className="form-group">
                            <label>Current Password</label>
                            <div className="password-input-wrapper">
                                <input type={showPassword ? "text" : "password"} value={passwordData.current_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })} required />
                                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input type={showPassword ? "text" : "password"} value={passwordData.new_password}
                                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })} required minLength={6} />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input type={showPassword ? "text" : "password"} value={passwordData.confirm_password}
                                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })} required />
                        </div>
                        <button type="submit" className="btn btn-secondary" disabled={passwordLoading}>
                            {passwordLoading ? 'Updating...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Profile;
