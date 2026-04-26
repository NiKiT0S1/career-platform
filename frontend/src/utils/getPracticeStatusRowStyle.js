/**
 * ================================
 * getPracticeStatusRowStyle
 * ================================
 * Returns style based on practice status.
 *
 * Responsibilities:
 * - Applies row color depending on status
 *
 * Notes:
 * - Used in AdminStudentsTable
 * ================================
 */

export const getPracticeStatusRowStyle = (status) => {
    // if (status === "EMPLOYED") {
    //     return { backgroundColor: "#27b030", color: "white" };
    // }

    // if (status === "NOT_FOUND") {
    //     return { backgroundColor: "#b92828", color: "white" };
    // }

    if (status === "IN_PRACTICE") {
        return { backgroundColor: "#27b030", color: "white" };
    }

    if (status === "NOT_ASSIGNED") {
        return { backgroundColor: "#b92828", color: "white" };
    }

    if (status === "EARLY_COMPLETION") {
        return { backgroundColor: "#27b030", color: "white" };
    }

    if (status === "MOBILITY") {
        return { backgroundColor: "#27b030", color: "white" };
    }

    return {};
};