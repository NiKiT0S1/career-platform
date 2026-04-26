export const formatCompanyType = (type) => {
    const companyTypes = {
        ZHSHS: "ЖШС",
        AK: "АҚ",
        KB: "ҚБ",
        KEAK: "КЕАҚ",
        RMK: "РМК",
        ZHK: "ЖК",
        KK: "ҚҚ",
        SHZHK_RMK: "ШЖҚ РМК",
        ROO: "РОО",
        GZI: "ҒЗИ",
        OO: "ОО",
        ZTB: "ЗТБ",
        MEKEME: "Мекеме",
        EB_AK: "ЕБ АҚ",
        RMKK_PGO: "РМҚК РҒО",
        RMKK: "РМҚК",
        OOO: "OOO",
        SHZHK_MKK: "ШЖҚ МКК",
        KMM: "КММ",
        MM: "ММ",
        RKB: "РҚБ",
        RMM: "РММ",
    };

    return companyTypes[type] || type || "—";
};