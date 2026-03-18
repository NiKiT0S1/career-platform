import api from "./axios";

export const getStudentsPage = async (page = 0, size = 20) => {
    const response = await api.get("/api/admin/students", {
        params: {page, size},
    });

    return response.data;
};

export const filterStudents = async (filter, page = 0, size = 20) => {
    const response = await api.get("/api/admin/students/filter", {
        params: {...filters, page, size},
    });

    return response.data;
};

export const sendNotification = async (studentsIds, message) => {
    const response = await api.post("/api/admin/notifications/send", {
        studentsIds,
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