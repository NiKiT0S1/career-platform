export const getPracticeStatusRowStyle = (status) => {
    if (status === "EMPLOYED") {
        return { backgroundColor: "#27b030", color: "white" };
    }

    if (status === "NOT_FOUND") {
        return { backgroundColor: "#b92828", color: "white" };
    }

    return {};
};