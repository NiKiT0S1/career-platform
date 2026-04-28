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

import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { 
    loginRequest, 
    requestPasswordResetCode, 
    verifyResetCode, 
    resetPassword 
} from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const [authMode, setAuthMode] = useState("LOGIN");
    const [resetEmail, setResetEmail] = useState("");
    const [resetCode, setResetCode] = useState("");
    const [newResetPassword, setNewResetPassword] = useState("");
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [resetMessage, setResetMessage] = useState("");
    const [resetError, setResetError] = useState("");
    const [resendTimer, setResendTimer] = useState(0);
    const [isResetLoading, setIsResetLoading] = useState(false);

    const navigate = useNavigate();

    const {role, setRole, loading} = useAuth();

    useEffect(() => {
        if (resendTimer <= 0) return;

        const interval = setInterval(() => {
            setResendTimer((prev) => Math.max(prev - 1, 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [resendTimer]);

    useEffect(() => {
        if (!resetMessage && !resetError) return;

        const timeout = setTimeout(() => {
            setResetMessage("");
            setResetError("");
        }, 2500);

        return () => clearTimeout(timeout);
    }, [resetMessage, resetError]);

    useEffect(() => {
        if (!error) return;

        const timeout = setTimeout(() => {
            setError("");
        }, 2500);

        return () => clearTimeout(timeout);
    }, [error]);

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

    const resetForgotPasswordState = () => {
        setAuthMode("LOGIN");
        setResetEmail("");
        setResetCode("");
        setNewResetPassword("");
        setShowResetPassword(false);
        setResetMessage("");
        setResetError("");
        setResendTimer(0);
        setIsResetLoading(false);
    };

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

    const handleForgotPassword = async () => {
        const preparedEmail = email.trim();

        if (!preparedEmail) {
            setError("Please enter your email first");
            return;
        }

        try {
            setError("");
            setResetError("");
            setResetMessage("");
            setIsResetLoading(true);

            await requestPasswordResetCode(preparedEmail);

            setResetEmail(preparedEmail);
            setAuthMode("RESET_CODE");
            setResendTimer(60);
            setResetMessage("Reset code has been sent");
        }
        catch (err) {
            setError("");
            setResetError(err?.response?.data || "Failed to send reset code");
        }
        finally {
            setIsResetLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendTimer > 0 || isResetLoading) return;

        try {
            setResetError("");
            setResetMessage("");
            setIsResetLoading(true);

            await requestPasswordResetCode(resetEmail);

            setResendTimer(60);
            setResetMessage("New reset code has been sent");
        }
        catch (err) {
            setResetError(err?.response?.data || "Failed to resend reset code");
        }
        finally {
            setIsResetLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!resetCode.trim()) {
            setResetError("Please enter reset code");
            return;
        }

        if (!/^\d{6}$/.test(resetCode.trim())) {
            setResetError("Code must contain 6 digits");
            return;
        }

        try {
            setResetError("");
            setResetMessage("");
            setIsResetLoading(true);

            await verifyResetCode(resetEmail, resetCode.trim());

            setResetMessage("Code verified successfully");
            setAuthMode("RESET_PASSWORD");
        }
        catch (err) {
            setResetError(err?.response?.data || "Invalid reset code");
        }
        finally {
            setIsResetLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newResetPassword.trim()) {
            setResetError("Please enter new password");
            return;
        }

        if (newResetPassword.trim().length < 4) {
            setResetError("Password must contain at least 4 characters");
            return;
        }

        try {
            setResetError("");
            setResetMessage("");
            setIsResetLoading(true);

            await resetPassword(
                resetEmail,
                resetCode.trim(),
                newResetPassword.trim()
            );

            setResetMessage("Password changed successfully. Please log in.");

            setTimeout(() => {
                setPassword("");
                resetForgotPasswordState();
            }, 1200);
        }
        catch (err) {
            setResetError(err?.response?.data || "Failed to reset password");
        }
        finally {
            setIsResetLoading(false);
        }
    };

    const renderLoginForm = () => (
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
                        // onChange={(e) => setEmail(e.target.value)}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setError("");
                            setResetError("");
                            setResetMessage("");
                        }}
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

            <button
                type="button"
                className="app-auth-text-button"
                onClick={handleForgotPassword}
                disabled={isResetLoading}
            >
                Forgot Password?
            </button>

            {error && <div className="app-auth-error">{error}</div>}
            {resetError && <div className="app-auth-error">{resetError}</div>}
            {resetMessage && <div className="app-auth-success">{resetMessage}</div>}
        </form>
    );

    const renderResetCodeForm = () => (
        <div className="app-auth-reset-box">
            <h3 className="app-auth-reset-title">Password Recovery</h3>

            <p className="app-auth-reset-text">
                We sent a 6-digit code to your email.
                <br />
                Please check your inbox and spam folder.
            </p>

            <div className="app-auth-reset-timer">
                Resend available in: {resendTimer}s
            </div>

            <button
                type="button"
                className={`app-auth-text-button ${
                    resendTimer === 0 ? "app-auth-text-button--active" : ""
                }`}
                onClick={handleResendCode}
                disabled={resendTimer > 0 || isResetLoading}
            >
                Send code again
            </button>

            <div className="app-auth-form-group">
                <div className="app-auth-input-wrap">
                    <input
                        className="app-auth-input"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        value={resetCode}
                        onChange={(e) =>
                            setResetCode(e.target.value.replace(/\D/g, ""))
                        }
                    />
                </div>
            </div>

            <button
                type="button"
                className="app-auth-submit"
                onClick={handleVerifyCode}
                disabled={isResetLoading}
            >
                {isResetLoading ? "Checking..." : "Confirm Code"}
            </button>

            <button
                type="button"
                className="app-auth-text-button"
                onClick={resetForgotPasswordState}
            >
                Back to Login
            </button>

            {resetMessage && (
                <div className="app-auth-success">{resetMessage}</div>
            )}

            {resetError && (
                <div className="app-auth-error">{resetError}</div>
            )}
        </div>
    );

    const renderResetPasswordForm = () => (
        <div className="app-auth-reset-box">
            <h3 className="app-auth-reset-title">Enter New Password</h3>

            <div className="app-auth-form-group">
                <div className="app-auth-input-wrap">
                    <input
                        className="app-auth-input"
                        type={showResetPassword ? "text" : "password"}
                        placeholder="New password"
                        value={newResetPassword}
                        onChange={(e) => setNewResetPassword(e.target.value)}
                    />

                    <button
                        type="button"
                        className="app-auth-password-toggle"
                        onClick={() => setShowResetPassword((prev) => !prev)}
                        title={showResetPassword ? "Hide password" : "Show password"}
                    >
                        {showResetPassword ? "👁" : "⌣"}
                    </button>
                </div>
            </div>

            <button
                type="button"
                className="app-auth-submit"
                onClick={handleResetPassword}
                disabled={isResetLoading}
            >
                {isResetLoading ? "Saving..." : "Confirm"}
            </button>

            {/* <button
                type="button"
                className="app-auth-text-button"
                onClick={resetForgotPasswordState}
            >
                Back to Login
            </button> */}

            {resetMessage && (
                <div className="app-auth-success">{resetMessage}</div>
            )}

            {resetError && (
                <div className="app-auth-error">{resetError}</div>
            )}
        </div>
    );

    return (
        <AuthLayout>
            {/* <div className="app-auth-card__logo">
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
            </form> */}

            <div className="app-auth-card__logo">
                <img src="/aitu-logo.png" alt="Astana IT University" />
            </div>

            {authMode === "LOGIN" && renderLoginForm()}
            {authMode === "RESET_CODE" && renderResetCodeForm()}
            {authMode === "RESET_PASSWORD" && renderResetPasswordForm()}
        </AuthLayout>
    );
}