import api from "./axios";

export const getStudentProfile = async (studentId) => {
    const response = await api.get(`/api/student/profile/${studentId}`);

    // ВРЕМЕННЫЙ ФИКСИРОВАННЫЙ ID
    // const response = await api.get(`/api/student/profile/2424`);
    return response.data;
};

export const updateStudentCompany = async (studentId, companyName) => {
    const response = await api.put(`/api/student/company/${studentId}`, {
        companyName,
    });
    return response.data;
};

export const getStudentNotifications = async (studentId) => {
    const response = await api.get(`/api/student/notifications/${studentId}`);
    return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
    const response = await api.put(`/api/student/notifications/read/${notificationId}`);
    return response.data;
};

export const markAllNotificationsAsRead = async (studentId) => {
    const response = await api.put(`/api/student/notifications/read-all/${studentId}`);
    return response.data;
}

export const uploadStudentResume = async (studentId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(`/api/student/resume/${studentId}`, formData, {
        headers : {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};

export const previewStudentResume = async (studentId) => {
    const response = await api.get(`/api/student/resume/${studentId}`, {
        responseType: "blob",
    });

    return response.data; 
};

export const downloadThreeSidedContract = async () => {
    const response = await api.get("/api/student/contracts/three-sided", {
        responseType: "blob",
    });

    return response.data;
};

export const changeStudentPassword = async (studentId, currentPassword, newPassword) => {
    const response = await api.put(`/api/student/change-password/${studentId}`, {
        currentPassword,
        newPassword,
    });

    return response.data;
};