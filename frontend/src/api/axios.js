import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;

        if (status === 401 || status === 403 || status === 404) {
            const isAdminRoute = window.location.pathname.startsWith("/admin");
            const isStudentRoute = window.location.pathname.startsWith("/student");

            if (isAdminRoute || isStudentRoute) {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("adminActivePage");
                localStorage.removeItem("studentActivePage");

                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;