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
    // if (status === "NOT_FOUND") return "NOT FOUND";
    // if (status === "EMPLOYED") return "EMPLOYED";
    if (status === "IN_PRACTICE") return "IN PRACTICE";
    if (status === "NOT_ASSIGNED") return "NOT ASSIGNED";
    if (status === "EARLY_COMPLETION") return "EARLY COMPLETION";
    if (status === "MOBILITY") return "MOBILITY";
    return status;
};