import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);
            setError("");

            const res = await API.post("/auth/login", {
                email,
                password
            });

            // Save token
            localStorage.setItem("token", res.data.token);

            // Save user
            localStorage.setItem("user", JSON.stringify(res.data.user));

            // Redirect to chat
            navigate("/");

        }

        catch (err) {

            setError(
                err.response?.data?.message ||
                "Login failed"
            );

        }

        finally {
            setLoading(false);
        }

    };

    return (

        <div style={styles.container}>

            <form onSubmit={handleLogin} style={styles.form}>

                <h2 style={styles.title}>ChatSphere Login</h2>

                {error && <p style={styles.error}>{error}</p>}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                />

                <button
                    type="submit"
                    style={styles.button}
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p style={styles.text}>
                    Don't have an account?{" "}
                    <Link to="/register">Register</Link>
                </p>

            </form>

        </div>

    );

}

const styles = {

    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#0f172a"
    },

    form: {
        background: "#1e293b",
        padding: "30px",
        borderRadius: "10px",
        width: "300px",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
    },

    title: {
        color: "white",
        textAlign: "center"
    },

    input: {
        padding: "10px",
        borderRadius: "5px",
        border: "none"
    },

    button: {
        padding: "10px",
        background: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
    },

    error: {
        color: "red",
        fontSize: "14px"
    },

    text: {
        color: "white",
        fontSize: "14px",
        textAlign: "center"
    }

};

export default Login;
