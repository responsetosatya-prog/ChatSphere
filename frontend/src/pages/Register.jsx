// frontend/src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await API.post("/auth/register", form);
      
      if (res.data.success) {
        setSuccess(res.data.message);
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join ChatSphere and start chatting!</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Choose a username"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password (min 6 chars)"
              style={styles.input}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading && styles.buttonLoading)
            }}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p style={styles.footer}>
            Already have an account? <Link to="/login" style={styles.link}>Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "#0f172a",
    padding: "20px"
  },
  card: {
    background: "#1e293b",
    padding: "40px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
  },
  header: {
    textAlign: "center",
    marginBottom: "30px"
  },
  title: {
    color: "#ffffff",
    fontSize: "28px",
    marginBottom: "8px"
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "14px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  label: {
    color: "#e2e8f0",
    fontSize: "14px",
    fontWeight: "500"
  },
  input: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#ffffff",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s"
  },
  button: {
    padding: "14px",
    background: "#22c55e",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    marginTop: "8px"
  },
  buttonLoading: {
    opacity: 0.7,
    cursor: "not-allowed"
  },
  error: {
    background: "#7f1d1d",
    color: "#fca5a5",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    textAlign: "center"
  },
  success: {
    background: "#064e3b",
    color: "#86efac",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    textAlign: "center"
  },
  footer: {
    color: "#94a3b8",
    fontSize: "14px",
    textAlign: "center",
    marginTop: "8px"
  },
  link: {
    color: "#60a5fa",
    textDecoration: "none",
    fontWeight: "500"
  }
};

export default Register;
