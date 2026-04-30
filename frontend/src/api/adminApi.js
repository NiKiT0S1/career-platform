/**
 * ================================
 * adminApi
 * ================================
 * API module for admin actions.
 *
 * Responsibilities:
 * - Loads students, filters, groups, programs and courses
 * - Sends notifications
 * - Manages templates
 * - Updates student fields
 * - Changes admin password
 *
 * Notes:
 * - Used by AdminDashboard
 * ================================
 */

import api from "./axios";

export const getCurrentAdmin = async () => {
    const response = await api.get("/api/admin/me");
    return response.data
};

export const getCourses = async () => {
    const response = await api.get("/api/admin/students/courses");
    return response.data;
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
        fullName: filters.fullName || null,
        
        educationalProgram: filters.educationalProgram || null,

        groupName: filters.groupName || null,

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

export const getTemplatesAdmin = async () => {
    const response = await api.get("/api/admin/templates");
    return response.data;
};

export const uploadTemplate = async (formData) => {
    const response = await api.post("/api/admin/templates", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const downloadTemplateForAdmin = async (templateId) => {
    const response = await api.get(`/api/admin/templates/${templateId}`, {
        responseType: "blob",
    });

    return response.data;
};

export const updateTemplateDisplayName = async (templateId, displayName) => {
    const response = await api.put(`/api/admin/templates/${templateId}/display-name`, {
        displayName,
    });

    return response.data;
};

export const updateTemplateCategory = async (templateId, category) => {
    const response = await api.put(`/api/admin/templates/${templateId}/category`, {
        category,
    });

    return response.data;
};

export const replaceTemplateFile = async (templateId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.put(`/api/admin/templates/${templateId}/file`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};

export const deleteTemplate = async (templateId) => {
    await api.delete(`/api/admin/templates/${templateId}`);
};

export const changeAdminPassword = async (currentPassword, newPassword) => {
    const response = await api.put("/api/admin/change-password", {
        currentPassword,
        newPassword,
    });

    return response.data;
};

export const updateStudentField = async (studentId, field, value) => {
    const response = await api.patch(`/api/admin/students/${studentId}`, {
        field,
        value,
    });

    return response.data;
};

export const getStudentPractice = async (studentId) => {
    const response = await api.get(`/api/admin/students/${studentId}/practice`);
    return response.data;
};

export const updateStudentPractice = async (studentId, payload) => {
    const response = await api.patch(`/api/admin/students/${studentId}/practice`, payload);
    return response.data;
};

export const searchCompanies = async (query) => {
    const response = await api.get(`/api/admin/companies/search`, {
        params: {query},
    });

    return response.data;
};

export const getPracticeSettings = async () => {
    const response = await api.get("/api/admin/practice-settings");
    return response.data;
};

export const updatePracticeSettings = async (payload) => {
    const response = await api.put("/api/admin/practice-settings", payload);
    return response.data;
};

export const exportStudentsToExcel = async (filters, sortBy, sortDir, selectedStudentIds = []) => {
    const response = await api.get("/api/admin/students/export", {
        params: {
            fullName: filters.fullName || undefined,
            educationalProgram: filters.educationalProgram || undefined,
            groupName: filters.groupName || undefined,
            course: filters.course || undefined,
            practiceStatus: filters.practiceStatus || undefined,
            minGpa: filters.minGpa || undefined,
            sortBy: sortBy || undefined,
            sortDir: sortBy ? sortDir : undefined,
            selectedIds: selectedStudentIds.length > 0
                ? selectedStudentIds.join(",")
                : undefined,
        },
        responseType: "blob",
    });

    return response.data;
};

export const getAllStudentIds = async () => {
    const response = await api.get("/api/admin/students/ids");
    return response.data;
};

export const getSelectedStudentsByIds = async (selectedStudentIds) => {
    const response = await api.get("/api/admin/students/selected", {
        params: {
            selectedIds: selectedStudentIds.join(","),
        },
    });

    return response.data;
};