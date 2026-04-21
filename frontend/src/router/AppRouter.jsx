/**
 * ================================
 * AppRouter
 * ================================
 * Main application router.
 *
 * Responsibilities:
 * - Declares public and protected routes
 * - Redirects users based on authentication and role
 *
 * Notes:
 * - Works together with ProtectedRoute and RoleProtectedRoute
 * ================================
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import StudentDashboard from "../pages/StudentDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";
import { useAuth } from "../context/AuthContext";

function DefaultRedirect() {
    const {role, loading} = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!role) return <Navigate to="/login" replace />;

    if (role === "STUDENT") return <Navigate to="/student/main" replace />;
    if (role === "ADMIN") return <Navigate to="/admin/students" replace />;

    return <Navigate to="/login" replace />;
}

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route 
                    path="/student/:page" 
                    element={
                        <ProtectedRoute>
                            <RoleProtectedRoute allowedRole="STUDENT">
                                <StudentDashboard />
                            </RoleProtectedRoute>
                        </ProtectedRoute>
                    } 
                />

                <Route 
                    path="/admin/:page" 
                    element={
                        <ProtectedRoute>
                            <RoleProtectedRoute allowedRole="ADMIN">
                                <AdminDashboard />
                            </RoleProtectedRoute>
                        </ProtectedRoute>
                    } 
                />
                
                <Route path="*" element={<DefaultRedirect />} />
            </Routes>
        </BrowserRouter>
    );
}