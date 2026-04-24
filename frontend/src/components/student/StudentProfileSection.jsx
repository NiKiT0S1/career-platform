/**
 * ================================
 * StudentProfileSection
 * ================================
 * Student profile section component.
 *
 * Responsibilities:
 * - Displays student profile data
 * - Handles company editing UI
 * - Handles practice status editing UI
 *
 * Notes:
 * - Controlled by StudentDashboard
 * ================================
 */

export default function StudentProfileSection({
    student,
    // companyName,
    // setCompanyName,
    // isEditingCompany,
    // setIsEditingCompany,
    // companyEditRef,
    // isCompanyConfirmed,
    // setIsCompanyConfirmed,
    // companyConfirmError,
    // setCompanyConfirmError,
    // handleUpdateCompany,
    // practiceStatus,
    // setPracticeStatus,
    // hasPracticeStatusChanged,
    // handleUpdatePracticeStatus,
    formatPracticeStatus,
    message,
}) {



    return (
        <div className="student-profile-page">
            <h1 className="student-profile-page__title">Profile</h1>

            <div className="student-profile-hero">
                <div className="student-profile-avatar student-profile-avatar--placeholder">
                    <span>👤</span>
                </div>

                <div className="student-profile-hero__info">
                    <h2 className="student-profile-name">{student.fullName}</h2>
                    <p className="student-profile-subtext">{student.email}</p>
                    <p className="student-profile-subtext">{student.groupName}</p>
                </div>
            </div>

            <div className="student-profile-details">
                <div className="student-profile-details__column">
                    <div className="student-detail-row">
                        <span className="student-detail-icon">🎓</span>
                        <span>Course: {student.course}</span>
                    </div>

                    <div className="student-detail-row">
                        <span className="student-detail-icon">📚</span>
                        <span>Educational Program: {student.educationalProgram}</span>
                    </div>

                    {/* <div className="student-detail-row">
                        <span className="student-detail-icon">📊</span>
                        <span>GPA: {student.gpa}</span>
                    </div>

                    <div className="student-detail-row">
                        <span className="student-detail-icon">📞</span>
                        <span>Phone: {student.phone || "-"}</span>
                    </div> */}
                </div>

                <div className="student-profile-details__column">
                    <div className="student-detail-row student-detail-row--company">
                        <span className="student-detail-icon">💼</span>
                        <span>Company: {student.companyName || "-"}</span>

                        {/* {!isEditingCompany && (
                            <button
                                type="button"
                                className="student-inline-icon-btn"
                                onClick={() => {
                                    setIsEditingCompany(true);
                                    setIsCompanyConfirmed(false);
                                    setCompanyConfirmError("");
                                }}
                                title="Edit company"
                            >
                                ✎
                            </button>
                        )} */}
                    </div>

                    {/* {isEditingCompany && (
                        <div className="student-company-edit" ref={companyEditRef}>
                            <div className="student-company-edit__row">
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Enter company name"
                                />

                                <label className="student-company-confirm">
                                    <input
                                        type="checkbox"
                                        checked={isCompanyConfirmed}
                                        onChange={(e) => {
                                            setIsCompanyConfirmed(e.target.checked);
                                            if (e.target.checked) {
                                                setCompanyConfirmError("");
                                            }
                                        }}
                                    />
                                    <span>I confirm that the company name is correct</span>
                                </label>

                                <button
                                    className="primary-btn"
                                    onClick={async () => {
                                        const success = await handleUpdateCompany();

                                        if (success) {
                                            setIsEditingCompany(false);
                                        }
                                    }}
                                >
                                    Save
                                </button>
                            </div>

                            {companyConfirmError && (
                                <p className="student-company-confirm__error">
                                    {companyConfirmError}
                                </p>
                            )}
                        </div>
                    )} */}

                    <div className="student-detail-row student-detail-row--status">
                        <span className="student-detail-icon">🧍</span>
                        {/* <span>Status: {student.practiceStatus || "-"}</span> */}
                        <span>Status: {formatPracticeStatus(student.practiceStatus)}</span>

                        {/* <div className="student-status-inline">
                            <select
                                className="student-status-select"
                                value={practiceStatus}
                                onChange={(e) => setPracticeStatus(e.target.value)}
                            >
                                <option value="EMPLOYED">EMPLOYED</option>
                                <option value="NOT_FOUND">NOT FOUND</option>
                            </select>

                            {hasPracticeStatusChanged && (
                                <button
                                    className="primary-btn student-status-save-inline"
                                    onClick={handleUpdatePracticeStatus}
                                >
                                    Save
                                </button>
                            )}
                        </div> */}
                    </div>

                    {message && <p className="student-action-message">{message}</p>}
                </div>
            </div>
        </div>
    );
}