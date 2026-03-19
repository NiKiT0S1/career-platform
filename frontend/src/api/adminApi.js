import api from "./axios";

export const getStudentsPage = async (page = 0, size = 20) => {
    const response = await api.get("/api/admin/students", {
        params: {page, size},
    });

    return response.data;
};

export const filterStudents = async (filters, page = 0, size = 20) => {
    const response = await api.get("/api/admin/students/filter", {
        params: {...filters, page, size},
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