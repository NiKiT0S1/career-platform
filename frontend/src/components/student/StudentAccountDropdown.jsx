/**
 * ================================
 * StudentAccountDropdown
 * ================================
 * Account dropdown menu for student.
 *
 * Responsibilities:
 * - Handles password change UI
 * - Displays password status messages
 *
 * Notes:
 * - UI-only component
 * ================================
 */

export default function StudentAccountDropdown({
    showPasswordForm,
    setShowPasswordForm,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    showAccountCurrentPassword,
    setShowAccountCurrentPassword,
    showAccountNewPassword,
    setShowAccountNewPassword,
    handleChangePassword,
    accountPasswordMessage,
}) {
    return (
        <div className="student-account-menu">
            {!showPasswordForm ? (
                <button
                    type="button"
                    className="student-account-menu__item"
                    onClick={() => setShowPasswordForm(true)}
                >
                    Change Password
                </button>
            ) : (
                <div className="student-account-password-box">
                    <h4 className="student-account-password-box__title">
                        Change Password
                    </h4>

                    <div className="student-account-password-box__field">
                        <input
                            type={showAccountCurrentPassword ? "text" : "password"}
                            className="student-account-password-box__input"
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="student-account-password-box__toggle"
                            onClick={() => setShowAccountCurrentPassword((prev) => !prev)}
                        >
                            {showAccountCurrentPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    <div className="student-account-password-box__field">
                        <input
                            type={showAccountNewPassword ? "text" : "password"}
                            className="student-account-password-box__input"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="student-account-password-box__toggle"
                            onClick={() => setShowAccountNewPassword((prev) => !prev)}
                        >
                            {showAccountNewPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    <button
                        type="button"
                        className="student-account-password-box__save"
                        onClick={handleChangePassword}
                    >
                        Save Password
                    </button>

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
        </div>
    );
}