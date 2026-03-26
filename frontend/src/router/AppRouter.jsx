import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import StudentDashboard from "../pages/StudentDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";
import { getToken, getRole } from "../auth/auth";

function DefaultRedirect() {
    const token = getToken();
    const role = getRole();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (role === "STUDENT") {
        return <Navigate to="/student" replace />;
    }

    if (role === "ADMIN") {
        return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/login" replace />;
}

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route 
                    path="/student" 
                    element={
                        <ProtectedRoute>
                            <RoleProtectedRoute allowedRole="STUDENT">
                                <StudentDashboard />
                            </RoleProtectedRoute>
                        </ProtectedRoute>
                    } 
                />

                <Route 
                    path="/admin" 
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