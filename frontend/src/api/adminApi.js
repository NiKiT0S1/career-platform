import api from "./axios";

export const getAllStudents = async () => {
    const response = await api.get("/api/admin/students");
    return response.data;
};

export const filterStudents = async (filter) => {
    const response = await api.get("/api/admin/students/filter", {
        params: filters,
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