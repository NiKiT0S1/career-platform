import { Navigate } from "react-router-dom";
// import { getToken, getRole } from "../auth/auth";
// import { getRole, isAuthenticated } from "../auth/auth";
import { useAuth } from "../context/AuthContext";

export default function RoleProtectedRoute({children, allowedRole}) {
    // const token = getToken();
    // const role = getRole();
    const {role, loading} = useAuth();

    // if (!token) {
    //     return <Navigate to="/login" replace />;
    // }

    if (loading) return <div>Loading...</div>;

    // if (!isAuthenticated()) {
    //     return <Navigate to="/login" replace />;
    // }

    if (!role) {
        return <Navigate to="/login" replace />;
    }

    // if (role !== allowedRole) {
    //     if (role === "STUDENT") {
    //         return <Navigate to="/student" replace />;
    //     }
    //     if (role === "ADMIN") {
    //         return <Navigate to="/admin" replace />;
    //     }

    //     return <Navigate to="/login" replace />;
    // }

    if (role !== allowedRole) {
        return <Navigate to={role === "ADMIN" ? "/admin" : "/student"} replace />;
    }

    return children;
}