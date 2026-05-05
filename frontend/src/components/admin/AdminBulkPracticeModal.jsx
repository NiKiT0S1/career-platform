import { useEffect, useRef, useState } from "react";
import { searchCompanies } from "../../api/adminApi";

export default function AdminBulkPracticeModal({
    isOpen,
    selectedCount,

    selectedStudents,

    onClose,
    onSave,
    formatCompanyType,
    formatDocumentType,
    practiceSettings,
    isSaving,
    nextContractNumber,
}) {
    const [bulkPractice, setBulkPractice] = useState({});
    const [companySuggestions, setCompanySuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [useSequentialContractNumbers, setUseSequentialContractNumbers] = useState(false);

    const [showSequentialConfirm, setShowSequentialConfirm] = useState(false);

    const searchTimeoutRef = useRef(null);
    const suggestionBoxRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setBulkPractice({});
            setCompanySuggestions([]);
            setShowSuggestions(false);
            setUseSequentialContractNumbers(false);
            setShowSequentialConfirm(false);
            return;
        }

        setBulkPractice({
            companyName: "",
            companyType: "",
            practiceMode: "",
            practiceStatus: "",
            documentType: "",
            letterSent: "",
            contractNumber: "",
            contractDate: "",
            practiceStartDate: "",
            practiceEndDate: "",
        });

        setUseSequentialContractNumbers(false);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (
                suggestionBoxRef.current &&
                !suggestionBoxRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const updateField = (field, value) => {
        setBulkPractice((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCompanyNameChange = (value) => {
        updateField("companyName", value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (!value.trim()) {
            setCompanySuggestions([]);
            setShowSuggestions(false);
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const result = await searchCompanies(value.trim());
                setCompanySuggestions(result || []);
                setShowSuggestions(true);
            }
            catch (error) {
                console.error(error);
                setCompanySuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);
    };

    const handleSelectCompany = (company) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        setBulkPractice((prev) => ({
            ...prev,
            companyName: company.companyName || "",
            companyType: company.companyType || "",
            documentType: company.defaultDocumentType || "",
        }));

        setCompanySuggestions([]);
        setShowSuggestions(false);
    };

    const buildPayload = () => {
        const payload = {};

        Object.entries(bulkPractice).forEach(([key, value]) => {
            if (value !== "" && value !== null && value !== undefined) {
                payload[key] = value;
            }
        });

        if (payload.letterSent === "true") {
            payload.letterSent = true;
        }

        if (payload.letterSent === "false") {
            payload.letterSent = false;
        }

        if (useSequentialContractNumbers) {
            payload.assignSequentialContractNumbers = true;
            delete payload.contractNumber;
        }

        return payload;
    };

    // const hasAtLeastOneField = Object.values(bulkPractice).some(
    //     (value) => value !== "" && value !== null && value !== undefined
    // );

    const hasAtLeastOneField = 
        useSequentialContractNumbers ||
        Object.values(bulkPractice).some(
            (value) => value !== "" && value !== null && value !== undefined
        );

    const getLastSequentialContractNumber = () => {
        if (!nextContractNumber || !selectedCount) return "";

        const [sequencePart, yearCode] = nextContractNumber.split("-");
        const firstSequence = Number(sequencePart);

        if (!firstSequence || !yearCode) return "";

        const lastSequence = firstSequence + selectedCount - 1;
        const paddedLastSequence = String(lastSequence).padStart(sequencePart.length, "0");

        return `${paddedLastSequence}-${yearCode}`;
    };

    const studentsWithContractNumbers = (selectedStudents || []).filter(
        (student) => student.practice?.contractNumber
    );

    const studentsWithoutContractNumbersCount =
        selectedCount - studentsWithContractNumbers.length;

    const allSelectedStudentsHaveContractNumbers =
        selectedCount > 0 && studentsWithoutContractNumbersCount === 0;

    const getLastSequentialContractNumberForAssignableStudents = () => {
        if (!nextContractNumber || studentsWithoutContractNumbersCount <= 0) return "";

        const [sequencePart, yearCode] = nextContractNumber.split("-");
        const firstSequence = Number(sequencePart);

        if (!firstSequence || !yearCode) return "";

        const lastSequence = firstSequence + studentsWithoutContractNumbersCount - 1;
        const paddedLastSequence = String(lastSequence).padStart(sequencePart.length, "0");

        return `${paddedLastSequence}-${yearCode}`;
    };

    const handleToggleSequentialNumbers = () => {
        if (allSelectedStudentsHaveContractNumbers) {
            return;
        }

        if (!useSequentialContractNumbers && studentsWithContractNumbers.length > 0) {
            setShowSequentialConfirm(true);
            return;
        }

        setUseSequentialContractNumbers((prev) => !prev);

        setBulkPractice((prev) => ({
            ...prev,
            contractNumber: "",
        }));
    };

    const handleConfirmSequentialNumbers = () => {
        setShowSequentialConfirm(false);
        setUseSequentialContractNumbers(true);

        setBulkPractice((prev) => ({
            ...prev,
            contractNumber: "",
        }));
    };

    return (
        <div className="admin-practice-modal-backdrop" onClick={onClose}>
            <div className="admin-practice-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-practice-modal__header">
                    <div>
                        <h3 className="admin-practice-modal__title">
                            Bulk Edit Practice
                        </h3>
                        <p className="admin-practice-modal__subtitle">
                            Selected students: {selectedCount}. Only filled fields will be updated.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="admin-practice-modal__close"
                        onClick={onClose}
                        disabled={isSaving}
                    >
                        ×
                    </button>
                </div>

                <div className="admin-practice-modal__grid">
                    <div
                        className="admin-practice-modal__field admin-practice-modal__field--company"
                        ref={suggestionBoxRef}
                    >
                        <label className="admin-practice-modal__label">
                            Company Name
                        </label>

                        <input
                            className="admin-practice-modal__input"
                            type="text"
                            value={bulkPractice.companyName || ""}
                            onChange={(e) => handleCompanyNameChange(e.target.value)}
                            onFocus={() => {
                                if (companySuggestions.length > 0) {
                                    setShowSuggestions(true);
                                }
                            }}
                        />

                        {showSuggestions && companySuggestions.length > 0 && (
                            <div className="admin-practice-modal__suggestions">
                                {companySuggestions.map((company) => (
                                    <button
                                        key={company.id}
                                        type="button"
                                        className="admin-practice-modal__suggestion-item"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleSelectCompany(company);
                                        }}
                                    >
                                        <div className="admin-practice-modal__suggestion-name">
                                            {company.companyName}
                                        </div>
                                        <div className="admin-practice-modal__suggestion-meta">
                                            {formatCompanyType(company.companyType)} ·{" "}
                                            {formatDocumentType(company.defaultDocumentType)}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="admin-practice-modal__field">
                        <label className="admin-practice-modal__label">Company Type</label>
                        <select
                            className="admin-practice-modal__input"
                            value={bulkPractice.companyType || ""}
                            onChange={(e) => updateField("companyType", e.target.value)}
                        >
                            <option value="">Do not update</option>
                            <option value="ZHSHS">ЖШС</option>
                            <option value="AK">АҚ</option>
                            <option value="KB">ҚБ</option>
                            <option value="KEAK">КЕАҚ</option>
                            <option value="RMK">РМК</option>
                            <option value="ZHK">ЖК</option>
                            <option value="KK">ҚҚ</option>
                            <option value="SHZHK_RMK">ШЖҚ РМК</option>
                            <option value="ROO">РОО</option>
                            <option value="GZI">ҒЗИ</option>
                            <option value="OO">ОО</option>
                            <option value="ZTB">ЗТБ</option>
                            <option value="MEKEME">Мекеме</option>
                            <option value="EB_AK">ЕБ АҚ</option>
                            <option value="RMKK_PGO">РМҚК РҒО</option>
                            <option value="RMKK">РМҚК</option>
                            <option value="OOO">OOO</option>
                            <option value="SHZHK_MKK">ШЖҚ МКК</option>
                            <option value="KMM">КММ</option>
                            <option value="MM">ММ</option>
                            <option value="RKB">РҚБ</option>
                            <option value="RMM">РММ</option>
                        </select>
                    </div>

                    <div className="admin-practice-modal__field">
                        <label className="admin-practice-modal__label">Practice Mode</label>
                        <select
                            className="admin-practice-modal__input"
                            value={bulkPractice.practiceMode || ""}
                            onChange={(e) => {
                                const value = e.target.value;

                                setBulkPractice((prev) => ({
                                    ...prev,
                                    practiceMode: value,
                                    practiceStartDate:
                                        value === "REGULAR_PRACTICE"
                                            ? practiceSettings?.regularPracticeStartDate || ""
                                            : prev.practiceStartDate,
                                    practiceEndDate:
                                        value === "REGULAR_PRACTICE"
                                            ? practiceSettings?.regularPracticeEndDate || ""
                                            : prev.practiceEndDate,
                                }));
                            }}
                        >
                            <option value="">Do not update</option>
                            <option value="REGULAR_PRACTICE">Regular Practice</option>
                            <option value="EARLY_PRACTICE">Early Practice</option>
                        </select>
                    </div>

                    <div className="admin-practice-modal__field">
                        <label className="admin-practice-modal__label">Practice Status</label>
                        <select
                            className="admin-practice-modal__input"
                            value={bulkPractice.practiceStatus || ""}
                            onChange={(e) => updateField("practiceStatus", e.target.value)}
                        >
                            <option value="">Do not update</option>
                            <option value="IN_PRACTICE">IN PRACTICE</option>
                            <option value="NOT_ASSIGNED">NOT ASSIGNED</option>
                            <option value="EARLY_COMPLETION">EARLY COMPLETION</option>
                            <option value="MOBILITY">MOBILITY</option>
                        </select>
                    </div>

                    <div className="admin-practice-modal__field">
                        <label className="admin-practice-modal__label">Document Type</label>
                        <select
                            className="admin-practice-modal__input"
                            value={bulkPractice.documentType || ""}
                            onChange={(e) => updateField("documentType", e.target.value)}
                        >
                            <option value="">Do not update</option>
                            <option value="BILATERAL_CONTRACT">2-Х СТОРОННИЙ ДОГОВОР</option>
                            <option value="MEMORANDUM">МЕМОРАНДУМ</option>
                            <option value="TRILATERAL_CONTRACT">3-Х СТОРОННИЙ ДОГОВОР</option>
                            <option value="OFFICIAL_MEMO">СЛУЖЕБНАЯ ЗАПИСКА</option>
                            <option value="DUAL_EDUCATION">ДУАЛЬНОЕ ОБУЧЕНИЕ</option>
                            <option value="EMPLOYMENT_CERTIFICATE">СПРАВКА С МЕСТА РАБОТЫ</option>
                        </select>
                    </div>

                    <div className="admin-practice-modal__field">
                        <label className="admin-practice-modal__label">Letter Sent</label>
                        <select
                            className="admin-practice-modal__input"
                            value={bulkPractice.letterSent || ""}
                            onChange={(e) => updateField("letterSent", e.target.value)}
                        >
                            <option value="">Do not update</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>

                    <div className="admin-practice-modal__field">
                        <label className="admin-practice-modal__label">
                            Contract Number
                        </label>
                        {/* <input
                            className="admin-practice-modal__input"
                            type="text"
                            placeholder={
                                useSequentialContractNumbers
                                ? `Starts from ${nextContractNumber || "next number"}`
                                : nextContractNumber || ""
                            }
                            value={bulkPractice.contractNumber || ""}
                            disabled={useSequentialContractNumbers}
                            onChange={(e) => updateField("contractNumber", e.target.value)}
                        /> */}
                        <input
                            className="admin-practice-modal__input"
                            type="text"
                            placeholder={nextContractNumber || "Sequential numbering is not available"}
                            value={useSequentialContractNumbers ? nextContractNumber || "" : ""}
                            disabled
                            readOnly
                        />

                        {nextContractNumber && (
                            <button
                                type="button"
                                className="admin-practice-modal__helper-btn"
                                onClick={handleToggleSequentialNumbers}
                                disabled={allSelectedStudentsHaveContractNumbers}
                            >
                                {useSequentialContractNumbers
                                    ? "Cancel sequential numbers"
                                    : "Use sequential numbers"}
                            </button>
                        )}

                        {/* {useSequentialContractNumbers && nextContractNumber && (
                            <p className="admin-practice-modal__hint">
                                Numbers will be assigned automatically starting from {nextContractNumber}.
                            </p>
                        )} */}
                        {useSequentialContractNumbers && nextContractNumber && (
                            <p className="admin-practice-modal__hint">
                                First number: {nextContractNumber}. Last number: {getLastSequentialContractNumberForAssignableStudents()}.
                            </p>
                        )}

                        {!useSequentialContractNumbers && nextContractNumber && !allSelectedStudentsHaveContractNumbers && (
                            <p className="admin-practice-modal__hint">
                                Enable sequential numbers to assign contract numbers from {nextContractNumber}.
                            </p>
                        )}

                        {allSelectedStudentsHaveContractNumbers && (
                            <p className="admin-practice-modal__hint admin-practice-modal__hint--warning">
                                All selected students already have contract numbers. Sequential numbering is not available.
                            </p>
                        )}
                    </div>

                    <div className="admin-practice-modal__field">
                        <label className="admin-practice-modal__label">Contract Date</label>
                        <input
                            className="admin-practice-modal__input"
                            type="date"
                            value={bulkPractice.contractDate || ""}
                            onChange={(e) => updateField("contractDate", e.target.value)}
                        />
                    </div>

                    <div className="admin-practice-modal__field">
                        <label className="admin-practice-modal__label">Practice Start Date</label>
                        <input
                            className="admin-practice-modal__input"
                            type="date"
                            value={bulkPractice.practiceStartDate || ""}
                            readOnly={bulkPractice.practiceMode === "REGULAR_PRACTICE"}
                            onChange={(e) => updateField("practiceStartDate", e.target.value)}
                        />
                    </div>

                    <div className="admin-practice-modal__field">
                        <label className="admin-practice-modal__label">Practice End Date</label>
                        <input
                            className="admin-practice-modal__input"
                            type="date"
                            value={bulkPractice.practiceEndDate || ""}
                            readOnly={bulkPractice.practiceMode === "REGULAR_PRACTICE"}
                            onChange={(e) => updateField("practiceEndDate", e.target.value)}
                        />
                    </div>
                </div>

                <div className="admin-practice-modal__actions">
                    <button
                        type="button"
                        className="admin-practice-modal__save"
                        disabled={!hasAtLeastOneField || isSaving}
                        onClick={() => onSave(buildPayload())}
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </button>

                    <button
                        type="button"
                        className="admin-practice-modal__cancel"
                        onClick={onClose}
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                </div>

                {showSequentialConfirm && (
                    <div className="admin-practice-confirm">
                        <div className="admin-practice-confirm__box">
                            <h4 className="admin-practice-confirm__title">
                                Existing contract numbers found
                            </h4>

                            <p className="admin-practice-confirm__text">
                                Some selected students already have contract numbers. Sequential numbers will be assigned only to students without contract numbers.
                            </p>

                            <div className="admin-practice-confirm__list">
                                {studentsWithContractNumbers.map((student) => (
                                    <div
                                        key={student.id}
                                        className="admin-practice-confirm__item"
                                    >
                                        <span>{student.fullName}</span>
                                        <strong>{student.practice?.contractNumber}</strong>
                                    </div>
                                ))}
                            </div>

                            <p className="admin-practice-confirm__text">
                                First assigned number: <strong>{nextContractNumber}</strong><br />
                                Last assigned number: <strong>{getLastSequentialContractNumberForAssignableStudents()}</strong>
                            </p>

                            <div className="admin-practice-confirm__actions">
                                <button
                                    type="button"
                                    className="admin-practice-modal__cancel"
                                    onClick={() => setShowSequentialConfirm(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="admin-practice-modal__save"
                                    onClick={handleConfirmSequentialNumbers}
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}