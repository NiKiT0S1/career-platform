export const getDisplayFileName = (fileName, maxLength = 24) => {
    if (!fileName) return "";

    const cleanedName = fileName.replace(/_\d+\.(pdf|docx)$/i, ".$1");

    if (cleanedName.length <= maxLength) {
        return cleanedName;
    }

    const dotIndex = cleanedName.lastIndexOf(".");
    const extension = dotIndex !== -1 ? cleanedName.slice(dotIndex) : "";
    const baseName = dotIndex !== -1 ? cleanedName.slice(0, dotIndex) : cleanedName;

    return `${baseName.slice(0, maxLength)}...${extension}`;
};

export const getResumeFileName = (resumePath) => {
    if (!resumePath) return "CV.pdf";
    return resumePath.split("/").pop();
};