import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* DEFAULT ROUTE */}
                <Route
    path="/"
    element={
        localStorage.getItem("token")
            ? <Navigate to="/chat" />
            : <Navigate to="/login" />
    }
/>

                {/* LOGIN */}
                <Route path="/login" element={<Login />} />

                {/* REGISTER */}
                <Route path="/register" element={<Register />} />

                {/* CHAT (PROTECTED) */}
                <Route
                    path="/chat"
                    element={
                        <ProtectedRoute>
                            <Chat />
                        </ProtectedRoute>
                    }
                />

                {/* FALLBACK */}
                <Route
                    path="*"
                    element={<Navigate to="/login" />}
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;
