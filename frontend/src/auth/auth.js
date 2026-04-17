// export const saveToken = (token) => {
//     localStorage.setItem("token", token);
// };

// export const saveRole = (role) => {
//     localStorage.setItem("role", role);
// };

// export const getToken = () => {
//     return localStorage.getItem("token");
// };

// export const getRole = () => {
//     return localStorage.getItem("role");
// };

// export const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("role");
// };

// export const isAuthenticated = () => {
//     return !!localStorage.getItem("token");
// };

export const logout = () => {
    // localStorage.removeItem("role");
    localStorage.removeItem("adminActivePage");
    localStorage.removeItem("studentActivePage");
};

// export const isAuthenticated = () => {
//     return !!localStorage.getItem("role");
// };