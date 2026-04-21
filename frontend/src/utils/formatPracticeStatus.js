/**
 * ================================
 * formatPracticeStatus
 * ================================
 * Formats practice status values.
 *
 * Responsibilities:
 * - Converts enum to readable text
 *
 * Notes:
 * - Used in tables and UI
 * ================================
 */

export const formatPracticeStatus = (status) => {
    if (status === "NOT_FOUND") return "NOT FOUND";
    if (status === "EMPLOYED") return "EMPLOYED";
    return status;
};