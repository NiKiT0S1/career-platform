/**
 * ================================
 * fileValidation
 * ================================
 * File validation helper functions.
 *
 * Responsibilities:
 * - Validates allowed file formats
 * - Validates dragged files
 *
 * Notes:
 * - Shared between admin and student pages
 * ================================
 */

export const isPdfFile = (file) => {
    if (!file) return false;

    const fileName = file.name?.toLowerCase() || "";
    const fileType = file.type || "";

    return (
        fileType === "application/pdf" ||
        fileName.endsWith(".pdf")
    );
};

export const isDocxFile = (file) => {
    if (!file) return false;

    const fileName = file.name?.toLowerCase() || "";
    const fileType = file.type || "";

    return (
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileName.endsWith(".docx")
    );
};

export const isAllowedTemplateFile = (file) => {
    return isPdfFile(file) || isDocxFile(file);
};

export const isDraggedPdf = (event) => {
    const item = event.dataTransfer?.items?.[0];
    if (!item || item.kind !== "file") return false;

    return item.type === "application/pdf";
};

export const isDraggedTemplateFile = (event) => {
    const item = event.dataTransfer?.items?.[0];
    if (!item || item.kind !== "file") return false;

    const type = item.type || "";

    return [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
    ].includes(type);
};