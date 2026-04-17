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