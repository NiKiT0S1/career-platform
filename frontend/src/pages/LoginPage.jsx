/**
 * ================================
 * LoginPage
 * ================================
 * Login page for students and admins.
 *
 * Responsibilities:
 * - Handles authentication form
 * - Sends login request
 * - Redirects user after successful login
 *
 * Notes:
 * - Uses AuthContext to restore and update auth state
 * ================================
 */

import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { loginRequest } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const {role, setRole, loading} = useAuth();

    if (loading) {
        return (
            <div className="app-page-loader">
                <div className="app-page-loader__text">Loading...</div>
            </div>
        );
    }

    if (role === "STUDENT") {
        return <Navigate to="/student/main" replace />;
    }

    if (role === "ADMIN") {
        return <Navigate to="/admin/students" replace />;
    }

    const handleLogin = async () => {
        try {
            setError("");

            const data = await loginRequest(email, password);

            setRole(data.role);
            
            if (data.role === "STUDENT") {
                navigate("/student/main");
            } 
            else if (data.role === "ADMIN") {
                navigate("/admin/students");
            }
        } 
        catch (err) {
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