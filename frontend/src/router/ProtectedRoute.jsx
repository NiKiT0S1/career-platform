import { Navigate } from "react-router-dom";
// import { getToken } from "../auth/auth";
// import { isAuthenticated } from "../auth/auth";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({children}) {
    // const token = getToken();
    const {role, loading} = useAuth();

    // if (!token) {
    //     return <Navigate to="/login" replace />;
    // }

    // if (!isAuthenticated()) {
    //     return <Navigate to="/login" replace />;
    // }

    if (loading) return <div>Loading...</div>;
    
    if (!role) {
        return <Navigate to="/login" replace />;
    }

    return children;
}