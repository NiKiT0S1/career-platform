import { useEffect, useState } from "react";

export default function AdminPracticeModal({
    isOpen,
    student,
    practice,
    onClose,
    onSave,
}) {
    const [localPractice, setLocalPractice] = useState({});

    useEffect(() => {
        setLocalPractice(practice || {});
    }, [practice]);

    if (!isOpen || !student || !localPractice) return null;

    const updateField = (field, value) => {
        setLocalPractice((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <div
            className="admin-practice-modal-backdrop"
            onClick={onClose}
        >
            <div
                className="admin-practice-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="admin-practice-modal__header">
                    <h3 className="admin-practice-modal__title">
                        Edit Practice: {student.fullName}
                    </h3>

                    <button
                        type="button"
                        className="admin-practice-modal__close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className="admin-practice-modal__grid">
                    <div className="admin-practice-modal__field">
                        <label className="admin-practice-modal__label">
                            Company Name
                        </label>
                        <input
                            className="admin-practice-modal__input"
                            type="text"
                            value={localPractice.companyName || ""}
                            onChange={(e) => updateField("companyName", e.target.value)}
                        />
                    </div>

                    <div className="admin-practice-modal__field">
                        <label className="admin-practice-modal__label">
                            Company Type
                        </label>
                        <select
                            className="admin-practice-modal__input"
                            value={localPractice.companyType || ""}
                            onChange={(e) =>
                                updateField("companyType", e.target.value || null)
                            }
                        >
                            <option value="" disabled>Select company type</option>
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
                        </select>
                    </div>

                    <div className="admin-practice-modal__field">
                        <label className="admin-practice-modal__label">
                            Practice Mode
                        </label>
                        <select
                            className="admin-practice-modal__input"
                            value={localPractice.practiceMode || ""}
                            onChange={(e) =>
                                updateField("practiceMode", e.target.value || null)
                            }
                        >
                            <option value="" disabled>Select practice mode</option>
                            <option value="REGULAR_PRACTICE">Regular Practice</option>
                            <option value="EARLY_PRACTICE">Early Practice</option>
                        </select>
                    </div>

                    <div className="admin-practice-modal__field">
                        <label className="admin-practice-modal__label">
                            Practice Status
                        </label>
                        <select
                            className="admin-practice-modal__input"
                            value={localPractice.practiceStatus || ""}
                            onChange={(e) =>
                                updateField("practiceStatus", e.target.value || null)
                            }
                        >
                            <option value="" disabled>Select practice status</option>
                            <option value="EMPLOYED">EMPLOYED</option>
                            <option value="NOT_FOUND">NOT FOUND</option>
                            <option value="IN_PRACTICE">IN PRACTICE</option>
                            <option value="NOT_ASSIGNED">NOT ASSIGNED</option>
                            <option value="EARLY_COMPLETION">EARLY COMPLETION</option>
                            <option value="MOBILITY">MOBILITY</option>
                        </select>
                    </div>

                    <div className="admin-practice-modal__field">
                        <label className="admin-practice-modal__label">
                            Document Type
                        </label>
                        <select
                            className="admin-practice-modal__input"
                            value={localPractice.documentType || ""}
                            onChange={(e) =>
                                updateField("documentType", e.target.value || null)
                            }
                        >
                            <option value="" disabled>Select document type</option>
                            <option value="BILATERAL_CONTRACT">2-Х СТОРОННИЙ ДОГОВОР</option>
                            <option value="MEMORANDUM">МЕМОРАНДУМ</option>
                            <option value="TRILATERAL_CONTRACT">3-Х СТОРОННИЙ ДОГОВОР</option>
                            <option value="OFFICIAL_MEMO">СЛУЖЕБНАЯ ЗАПИСКА</option>
                            <option value="DUAL_EDUCATION">ДУАЛЬНОЕ ОБУЧЕНИЕ</option>
                            <option value="EMPLOYMENT_CERTIFICATE">СПРАВКА С МЕСТА РАБОТЫ</option>
                        </select>
                    </div>

                    <div className="admin-practice-modal__field">
                        <label className="admin-practice-modal__label">
                            Letter Sent
                        </label>
                        <select
                            className="admin-practice-modal__input"
                            value={
                                localPractice.letterSent === null ||
                                localPractice.letterSent === undefined
                                    ? ""
                                    : String(localPractice.letterSent)
                            }
                            onChange={(e) =>
                                updateField(
                                    "letterSent",
                                    e.target.value === ""
                                        ? null
                                        : e.target.value === "true"
                                )
                            }
                        >
                            <option value="" disabled>Select value</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>

                    <div className="admin-practice-modal__field">
                        <label className="admin-practice-modal__label">
                            Contract Number
                        </label>
                        <input
                            className="admin-practice-modal__input"
                            type="text"
                            value={localPractice.contractNumber || ""}
                            onChange={(e) =>
                                updateField("contractNumber", e.target.value)
                            }
                        />
                    </div>

                    <div className="admin-practice-modal__field">
                        <label className="admin-practice-modal__label">
                            Contract Date
                        </label>
                        <input
                            className="admin-practice-modal__input"
                            type="date"
                            value={localPractice.contractDate || ""}
                            onChange={(e) =>
                                updateField("contractDate", e.target.value || null)
                            }
                        />
                    </div>

                    <div className="admin-practice-modal__field">
                        <label className="admin-practice-modal__label">
                            Practice Start Date
                        </label>
                        <input
                            className="admin-practice-modal__input"
                            type="date"
                            value={localPractice.practiceStartDate || ""}
                            onChange={(e) =>
                                updateField("practiceStartDate", e.target.value || null)
                            }
                        />
                    </div>

                    <div className="admin-practice-modal__field">
                        <label className="admin-practice-modal__label">
                            Practice End Date
                        </label>
                        <input
                            className="admin-practice-modal__input"
                            type="date"
                            value={localPractice.practiceEndDate || ""}
                            onChange={(e) =>
                                updateField("practiceEndDate", e.target.value || null)
                            }
                        />
                    </div>
                </div>

                <div className="admin-practice-modal__actions">
                    <button
                        type="button"
                        className="admin-practice-modal__save"
                        onClick={async () => {
                            await onSave(localPractice);
                        }}
                    >
                        Save
                    </button>

                    <button
                        type="button"
                        className="admin-practice-modal__cancel"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}