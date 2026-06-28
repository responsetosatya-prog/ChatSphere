import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaArrowRight, FaGithub, FaGoogle } from "react-icons/fa";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", { email, password });
      
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/chat", { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          <div className="auth-logo">💬</div>
          <h1>Welcome Back</h1>
          <p>Login to continue chatting with your friends</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-icon-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-icon-wrapper">
              <FaLock className="input-icon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <div className="auth-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
            <FaArrowRight />
          </button>

          <div className="auth-divider">
            <span>Or continue with</span>
          </div>

          <div className="social-buttons">
            <button type="button" className="btn btn-secondary">
              <FaGoogle /> Google
            </button>
            <button type="button" className="btn btn-secondary">
              <FaGithub /> GitHub
            </button>
          </div>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one now</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
