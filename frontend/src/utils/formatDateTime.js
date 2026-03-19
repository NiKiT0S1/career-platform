export const formatDateTime = (dateTime) => {
    if (!dateTime) return "-";

    return new Date(dateTime).toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};