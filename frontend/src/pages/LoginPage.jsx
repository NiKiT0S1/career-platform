import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { loginRequest } from "../api/authApi";
import {saveToken, saveRole, getToken, getRole} from "../auth/auth";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const token = getToken();
    const role = getRole();

    if (token && role === "STUDENT") {
        return <Navigate to="/student" replace />;
    }

    if (token && role === "ADMIN") {
        return <Navigate to="/admin" replace />;
    }

    const handleLogin = async () => {
        try {
            const data = await loginRequest(email, password);

            localStorage.removeItem("token");
            localStorage.removeItem("role");

            saveToken(data.token);
            saveRole(data.role);

            if (data.role === "STUDENT") {
                navigate("/student");
            }
            else if (data.role === "ADMIN") {
                navigate("/admin");
            }
        } 
        catch (err) {
            setError("Invalid email or password");
        }
    };

    return (
        <div style={{padding: "40px"}}>
            <h2>Digital Career Platform</h2>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <br /><br />

            <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <br /><br />

            <button type="button" onClick={() => setShowPassword((prev) => !prev)}>
                {showPassword ? "Hide Password" : "Show Password"}
            </button>
            
            <br /><br />

            <button onClick={handleLogin}>
                Login
            </button>

            {error && (
                <p style={{color: "red"}}>{error}</p>
            )}
        </div>
    );
}