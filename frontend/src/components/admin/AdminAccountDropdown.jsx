export default function AdminAccountDropdown({
    showPasswordForm,
    setShowPasswordForm,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    handleChangePassword,
    accountPasswordMessage,
    handleLogout,
}) {
    return (
        <div className="student-account-menu">
            {!showPasswordForm ? (
                <>
                    <button
                        type="button"
                        className="student-account-menu__item"
                        onClick={() => setShowPasswordForm(true)}
                    >
                        Change Password
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
            ) : (
                <div className="student-account-password-box">
                    <h4 className="student-account-password-box__title">
                        Change Password
                    </h4>

                    <div className="student-account-password-box__field">
                        <input
                            type={showCurrentPassword ? "text" : "password"}
                            className="student-account-password-box__input"
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="student-account-password-box__toggle"
                            onClick={() => setShowCurrentPassword((prev) => !prev)}
                        >
                            {showCurrentPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    <div className="student-account-password-box__field">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            className="student-account-password-box__input"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="student-account-password-box__toggle"
                            onClick={() => setShowNewPassword((prev) => !prev)}
                        >
                            {showNewPassword ? "Hide" : "Show"}
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