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

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);
            setError("");
            setSuccess("");

            const res = await API.post("/auth/register", form);

            setSuccess(res.data.message);

            // Wait 2 seconds then redirect to login
            setTimeout(() => {
                navigate("/login");
            }, 2000);

        }

        catch (err) {

            setError(
                err.response?.data?.message ||
                "Registration failed"
            );

        }

        finally {
            setLoading(false);
        }

    };

    return (

        <div style={styles.container}>

            <form onSubmit={handleSubmit} style={styles.form}>

                <h2 style={styles.title}>Create Account</h2>

                {error && <p style={styles.error}>{error}</p>}
                {success && <p style={styles.success}>{success}</p>}

                <input
                    type="text"
                    name="full_name"
                    placeholder="Full Name"
                    value={form.full_name}
                    onChange={handleChange}
                    style={styles.input}
                />

                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange}
                    style={styles.input}
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    style={styles.input}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    style={styles.input}
                />

                <button
                    type="submit"
                    style={styles.button}
                    disabled={loading}
                >
                    {loading ? "Creating account..." : "Register"}
                </button>

                <p style={styles.text}>
                    Already have an account?{" "}
                    <Link to="/login">Login</Link>
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
        width: "320px",
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
        background: "#22c55e",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
    },

    error: {
        color: "red",
        fontSize: "14px"
    },

    success: {
        color: "#22c55e",
        fontSize: "14px"
    },

    text: {
        color: "white",
        fontSize: "14px",
        textAlign: "center"
    }

};

export default Register;
