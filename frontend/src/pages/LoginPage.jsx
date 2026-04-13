import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { loginRequest } from "../api/authApi";
import { saveToken, saveRole, getToken, getRole } from "../auth/auth";
import AuthLayout from "../layouts/AuthLayout";

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
            setError("");

            const data = await loginRequest(email, password);

            localStorage.removeItem("token");
            localStorage.removeItem("role");

            saveToken(data.token);
            saveRole(data.role);

            if (data.role === "STUDENT") {
                navigate("/student");
            } else if (data.role === "ADMIN") {
                navigate("/admin");
            }
        } catch (err) {
            setError("Invalid email or password");
        }
    };

    return (
        <AuthLayout>
            <div className="app-auth-card__logo">
                <img src="/aitu-logo.png" alt="Astana IT University" />
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                }}
            >
                <div className="app-auth-form-group">
                    <div className="app-auth-input-wrap">
                        <input
                            className="app-auth-input"
                            type="email"
                            placeholder="Login"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="app-auth-form-group">
                    <div className="app-auth-input-wrap">
                        <input
                            className="app-auth-input"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <button
                            type="button"
                            className="app-auth-password-toggle"
                            onClick={() => setShowPassword((prev) => !prev)}
                            title={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? "👁" : "⌣"}
                        </button>
                    </div>
                </div>

                <button type="submit" className="app-auth-submit">
                    Log in
                </button>

                {error && <div className="app-auth-error">{error}</div>}
            </form>
        </AuthLayout>
    );
}