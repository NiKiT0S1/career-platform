export const formatDocumentType = (type) => {
    const documentTypes = {
        BILATERAL_CONTRACT: "Двухсторонний договор",
        MEMORANDUM: "Меморандум",
        TRILATERAL_CONTRACT: "Трехсторонний договор",
        OFFICIAL_MEMO: "Служебная записка",
        DUAL_EDUCATION: "Дуальное обучение",
        EMPLOYMENT_CERTIFICATE: "Справка с места работы",
    };

    return documentTypes[type] || type || "—";
};