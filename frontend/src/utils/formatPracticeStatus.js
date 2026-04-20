export const formatPracticeStatus = (status) => {
    if (status === "NOT_FOUND") return "NOT FOUND";
    if (status === "EMPLOYED") return "EMPLOYED";
    return status;
};