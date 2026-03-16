import api from "./axios";

export const loginRequest = async (email, password) => {
    const response = await api.post("/api/auth/login", {
        email,
        password,
    });

    return response.data;
};