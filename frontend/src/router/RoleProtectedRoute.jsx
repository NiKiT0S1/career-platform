/**
 * ================================
 * RoleProtectedRoute
 * ================================
 * Route guard for role-based access.
 *
 * Responsibilities:
 * - Restricts access depending on user role
 * - Redirects user to the correct page if role does not match
 *
 * Notes:
 * - Used for separating student and admin pages
 * ================================
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleProtectedRoute({children, allowedRole}) {
    const {role, loading} = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!role) {
        return <Navigate to="/login" replace />;
    }

    if (role !== allowedRole) {
        return <Navigate to={role === "ADMIN" ? "/admin" : "/student"} replace />;
    }

    return children;
}