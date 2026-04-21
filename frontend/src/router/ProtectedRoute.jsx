/**
 * ================================
 * ProtectedRoute
 * ================================
 * Route guard for authenticated users.
 *
 * Responsibilities:
 * - Blocks access for unauthorized users
 * - Redirects unauthenticated users to login page
 *
 * Notes:
 * - Uses auth state from AuthContext
 * ================================
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({children}) {
    const {role, loading} = useAuth();

    if (loading) return <div>Loading...</div>;
    
    if (!role) {
        return <Navigate to="/login" replace />;
    }

    return children;
}