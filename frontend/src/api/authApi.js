/**
 * ================================
 * authApi
 * ================================
 * Authentication API module.
 *
 * Responsibilities:
 * - Sends login request
 * - Sends logout request
 * - Fetches current authenticated user info
 *
 * Notes:
 * - Works with HttpOnly cookie authentication
 * ================================
 */

import api from "./axios";

export const getCurrentAuth = async () => {
    const response = await api.get("/api/auth/me");
    return response.data;
};

export const loginRequest = async (email, password) => {
    const response = await api.post("/api/auth/login", {
        email,
        password,
    });

    return response.data;
};

export const logoutRequest = async () => {
    const response = await api.post("/api/auth/logout");
    return response.data;
};

export const requestPasswordResetCode = async (email) => {
    const response = await api.post("/api/auth/forgot-password/request-code", {
        email,
    });

    return response.data;
};

export const verifyResetCode = async (email, code) => {
    const response = await api.post("/api/auth/forgot-password/verify-code", {
        email,
        code,
    });

    return response.data;
};

export const resetPassword = async (email, code, newPassword) => {
    const response = await api.post("/api/auth/forgot-password/reset", {
        email,
        code,
        newPassword,
    });
};