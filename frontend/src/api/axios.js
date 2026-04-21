/**
 * ================================
 * axios
 * ================================
 * Shared Axios instance for API communication.
 *
 * Responsibilities:
 * - Configures base API URL
 * - Sends requests with credentials
 *
 * Notes:
 * - Used by all frontend API modules
 * ================================
 */

import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;

        if (status === 401 || status === 403 || status === 404) {

            const isProtectedRoute = 
                window.location.pathname.startsWith("/admin") ||
                window.location.pathname.startsWith("/student");

            if (isProtectedRoute ) {
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