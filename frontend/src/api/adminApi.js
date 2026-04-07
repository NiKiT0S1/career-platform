import api from "./axios";

export const getCurrentAdmin = async () => {
    const response = await api.get("/api/admin/me");
    return response.data
};

export const getStudentsPage = async (page = 0, size = 20, sortBy = "", sortDir = "asc") => {
    const response = await api.get("/api/admin/students", {
        params: {
            page, 
            size,
            sortBy: sortBy || undefined,
            sortDir: sortBy ? sortDir : undefined,
        },
    });

    return response.data;
};

export const getEducationalPrograms = async () => {
    const response = await api.get("/api/admin/students/educational-programs");
    return response.data;
};

export const getGroups = async (educationalProgram) => {
    const response = await api.get("/api/admin/students/groups", {
        params: {
            educationalProgram: educationalProgram || undefined,
        },
    });

    return response.data;
};

export const filterStudents = async (filters, page = 0, size = 20, sortBy, sortDir) => {
    const response = await api.get("/api/admin/students/filter", {
        params: {...filters, page, size, sortBy, sortDir},
    });

    return response.data;
};

export const sendNotification = async (studentIds, message) => {
    const response = await api.post("/api/admin/notifications/send", {
        studentIds,
        message,
    });

    return response.data;
};

export const sendNotificationByFilter = async (filters, message) => {
    const response = await api.post("/api/admin/notifications/send-by-filter", {
        educationalProgram: filters.educationalProgram || null,
        course: filters.course ? Number(filters.course) : null,
        practiceStatus: filters.practiceStatus || null,
        minGpa: filters.minGpa ? Number(filters.minGpa) : null,
        message,
    });

    return response.data;
};

export const downloadStudentResume = async (studentId) => {
    const response = await api.get(`/api/admin/students/${studentId}/resume`, {
        responseType: "blob",
    });

    return response.data;
};

export const getStudentNotificationsForAdmin = async (studentId) => {
    const response = await api.get(`/api/admin/students/${studentId}/notifications`);
    return response.data;
};

export const changeAdminPassword = async (currentPassword, newPassword) => {
    const response = await api.put("/api/admin/change-password", {
        currentPassword,
        newPassword,
    });

    return response.data;
};