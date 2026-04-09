import api from "./axios";

export const getCurrentStudent = async () => {
    const response = await api.get("/api/student/me");
    return response.data
};

export const updateStudentCompany = async (companyName) => {
    const response = await api.put("/api/student/company", {
        companyName,
    });
    return response.data;
};

export const updateStudentPracticeStatus = async (practiceStatus) => {
    const response = await api.put("/api/student/practice-status", {
        practiceStatus,
    });

    return response.data;
};

export const getStudentNotifications = async () => {
    const response = await api.get("/api/student/notifications");
    return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
    const response = await api.put(`/api/student/notifications/read/${notificationId}`);
    return response.data;
};

export const markAllNotificationsAsRead = async () => {
    const response = await api.put("/api/student/notifications/read-all");
    return response.data;
}

export const uploadStudentResume = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/api/student/resume", formData, {
        headers : {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};

export const previewStudentResume = async () => {
    const response = await api.get("/api/student/resume", {
        responseType: "blob",
    });

    return response.data; 
};

// export const downloadResumeTemplate = async () => {
//     const response = await api.get("api/student/resume/template", {
//         responseType: "blob",
//     });

//     return response.data;
// };

// export const downloadThreeSidedContract = async () => {
//     const response = await api.get("/api/student/contracts/three-sided", {
//         responseType: "blob",
//     });

//     return response.data;
// };

export const getTemplates = async () => {
    const response = await api.get("/api/student/templates");
    return response.data;
};

export const downloadTemplate = async (templateId) => {
    const response = await api.get(`/api/student/templates/${templateId}`, {
        responseType: "blob",
    });

    return response.data;
};

export const changeStudentPassword = async (currentPassword, newPassword) => {
    const response = await api.put("/api/student/change-password", {
        currentPassword,
        newPassword,
    });

    return response.data;
};