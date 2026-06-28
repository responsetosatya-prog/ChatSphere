// frontend/src/services/api.js
import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL 
        ? `${import.meta.env.VITE_BACKEND_URL}/api`
        : "http://localhost:5000/api"
});

// Add token to every request
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle response errors
API.interceptors.response.use(
    (response) => {
        console.log(`📥 ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error("API Error:", error.response?.status, error.response?.data);
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default API;
