/**
 * ================================
 * AdminAccountDropdown
 * ================================
 * Account dropdown menu for admin.
 *
 * Responsibilities:
 * - Handles password change UI
 * - Handles logout action
 *
 * Notes:
 * - UI-only component
 * ================================
 */

export default function AdminAccountDropdown({
    showPasswordForm,
    setShowPasswordForm,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    // showCurrentPassword,
    // setShowCurrentPassword,
    // showNewPassword,
    // setShowNewPassword,
    showAdminPassword,
    setShowAdminPassword,
    handleChangePassword,
    accountPasswordMessage,

    showPracticeSettingsForm,
    setShowPracticeSettingsForm,
    regularPracticeStartDate,
    setRegularPracticeStartDate,
    regularPracticeEndDate,
    setRegularPracticeEndDate,
    handleSavePracticeSettings,
    practiceSettingsMessage,

    academicYearStart,
    setAcademicYearStart,

    handleLogout,
}) {

    const getAcademicYearCode = (startYear) => {
        if (!startYear || String(startYear).length !== 4) return "";

        const start = Number(startYear);
        const end = start + 1;

        return `${String(start).slice(-2)}${String(end).slice(-2)}`;
    };

    return (
        <div className="student-account-menu">
            {!showPasswordForm && !showPracticeSettingsForm && (
                <>
                    <button
                        type="button"
                        className="student-account-menu__item"
                        onClick={() => {
                            setShowPasswordForm(true);
                            setShowPracticeSettingsForm(false);
                        }}
                    >
                        Change Password
                    </button>

                    <br /><br />

                    <button
                        type="button"
                        className="student-account-menu__item"
                        onClick={() => {
                            setShowPracticeSettingsForm(true);
                            setShowPasswordForm(false);
                        }}
                    >
                        Practice Settings
                    </button>

                    <br /><br />

                    <button
                        type="button"
                        className="student-account-menu__item student-account-menu__item--danger"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </>
            )}

            {showPasswordForm && (
                <div className="student-account-password-box">
                    <h4 className="student-account-password-box__title">
                        Change Password
                    </h4>

                    <div className="student-account-password-box__field">
                        <input
                            type={showAdminPassword ? "text" : "password"}
                            className="student-account-password-box__input"
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </div>

                    <div className="student-account-password-box__field">
                        <input
                            type={showAdminPassword ? "text" : "password"}
                            className="student-account-password-box__input"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />

                        <button
                            type="button"
                            className="student-account-password-box__toggle"
                            onClick={() => setShowAdminPassword((prev) => !prev)}
                        >
                            {showAdminPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    <button
                        type="button"
                        className="student-account-password-box__save"
                        onClick={handleChangePassword}
                    >
                        Save Password
                    </button>

                    {/* <button
                        type="button"
                        className="student-account-menu__item"
                        onClick={() => {
                            setShowPasswordForm(false);
                            setShowAdminPassword(false);
                        }}
                    >
                        Back
                    </button> */}

                    {accountPasswordMessage && (
                        <p
                            className={`student-account-password-box__message ${
                                accountPasswordMessage.toLowerCase().includes("success")
                                    ? "success"
                                    : "error"
                            }`}
                        >
                            {accountPasswordMessage}
                        </p>
                    )}
                </div>
            )}

            {showPracticeSettingsForm && (
                <div className="student-account-password-box">
                    <h4 className="student-account-password-box__title">
                        Practice Settings
                    </h4>

                    <div className="practice-dates__row">
                        <label className="practice-dates__label">
                            Practice Start Date
                        </label>
                        <input
                            type="date"
                            className="student-account-password-box__input"
                            value={regularPracticeStartDate}
                            onChange={(e) => setRegularPracticeStartDate(e.target.value)}
                        />
                    </div>

                    <div className="practice-dates__row">
                        <label className="practice-dates__label">
                            Practice End Date
                        </label>
                        <input
                            type="date"
                            className="student-account-password-box__input"
                            value={regularPracticeEndDate}
                            onChange={(e) => setRegularPracticeEndDate(e.target.value)}
                        />
                    </div>

                    <div className="practice-dates__row practice-dates__row--stacked">
                        <label className="practice-dates__label">
                            Academic Year Start
                        </label>

                        <div className="practice-dates__control">
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={4}
                                className="student-account-password-box__input"
                                placeholder="2026"
                                value={academicYearStart}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                                    setAcademicYearStart(value);
                                }}
                            />

                            {getAcademicYearCode(academicYearStart) && (
                                <p className="practice-dates__hint">
                                    Contract year code: {getAcademicYearCode(academicYearStart)}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        className="student-account-password-box__save"
                        onClick={handleSavePracticeSettings}
                    >
                        Save Settings
                    </button>

                    <button
                        type="button"
                        className="student-account-password-box__save student-account-password-box__back"
                        // onClick={() => setShowPracticeSettingsForm(false)}
                        onClick={() => {
                            setShowPracticeSettingsForm(false);
                            // resetPracticeSettingsForm();
                        }}
                    >
                        Back
                    </button>

                    {practiceSettingsMessage && (
                        <p
                            className={`student-account-password-box__message ${
                                practiceSettingsMessage.toLowerCase().includes("success")
                                    ? "success"
                                    : "error"
                            }`}
                        >
                            {practiceSettingsMessage}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}