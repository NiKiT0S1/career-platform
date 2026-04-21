/**
 * ================================
 * auth
 * ================================
 * Helper functions for authentication-related client actions.
 *
 * Responsibilities:
 * - Clears local client-side session state
 *
 * Notes:
 * - Does not store sensitive auth data
 * ================================
 */

export const logout = () => {
    // localStorage.removeItem("role");
    localStorage.removeItem("adminActivePage");
    localStorage.removeItem("studentActivePage");
};