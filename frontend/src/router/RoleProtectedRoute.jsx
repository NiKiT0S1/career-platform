import { Navigate } from "react-router-dom";
import { getToken, getRole } from "../auth/auth";

export default function RoleProtectedRoute({children, allowedRole}) {
    const token = getToken();
    const role = getRole();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (role !== allowedRole) {
        if (role === "STUDENT") {
            return <Navigate to="/student" replace />;
        }
        if (role === "ADMIN") {
            return <Navigate to="/admin" replace />;
        }

        return <Navigate to="/login" replace />;
    }

    return children;
}