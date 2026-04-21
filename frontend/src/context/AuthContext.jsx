/**
 * ================================
 * AuthContext
 * ================================
 * Global authentication context.
 *
 * Responsibilities:
 * - Stores current user role
 * - Restores authentication state from backend
 * - Provides auth state to the whole application
 *
 * Notes:
 * - Used with HttpOnly cookie authentication
 * ================================
 */

import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentAuth } from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadAuth = async () => {
        try {
            const data = await getCurrentAuth();
            setRole(data.role);
        }
        catch {
            setRole(null);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAuth();
    }, []);

    return (
        <AuthContext.Provider value={{role, setRole, loading}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);