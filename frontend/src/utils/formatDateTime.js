/**
 * ================================
 * formatDateTime
 * ================================
 * Date-time formatting helper.
 *
 * Responsibilities:
 * - Converts backend timestamps into readable UI text
 *
 * Notes:
 * - Shared between notifications and other date-based UI
 * ================================
 */

export const formatDateTime = (dateTime) => {
    if (!dateTime) return "-";

    return new Date(dateTime).toLocaleString("ru-RU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Almaty",
    });
};