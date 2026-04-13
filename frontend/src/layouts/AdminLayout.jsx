import AppHeader from "../components/common/AppHeader";

export default function AdminLayout({
    children,
    adminName,
    activePage,
    onChangePage,

    accountOpen = false,
    onToggleAccount,
    onCloseAccount,
    renderAccountDropdown,
}) {
    const headerActions = [
        {
            key: "main",
            title: "Main Page",
            isActive: activePage === "students",
            onClick: () => onChangePage?.("students"),
            icon: "📋",
        },
        {
            key: "templates",
            title: "Templates",
            isActive: activePage === "templates",
            onClick: () => onChangePage?.("templates"),
            icon: "🧾",
        },
        {
            key: "account",
            title: "Account",
            isActive: accountOpen,
            onClick: onToggleAccount,
            icon: "👤",
        },
    ];

    return (
        <div className="admin-layout">
            <div className="admin-layout__top">
                <div className="admin-layout__brand">
                    <img src="/aitu-white-logo.png" alt="AITU" />
                </div>

                <div className="admin-layout__hello">
                    Hello, {adminName || "admin"}!
                </div>

                <div className="admin-layout__header">
                    <AppHeader
                        actions={headerActions}
                        notificationsOpen={false}
                        onCloseNotifications={() => {}}
                        notifications={[]}
                        onClearNotifications={() => {}}
                        renderNotification={null}
                        accountOpen={accountOpen}
                        onCloseAccount={onCloseAccount}
                        renderAccountDropdown={renderAccountDropdown}
                    />
                </div>
            </div>

            <div className="admin-layout__content-card">
                {children}
            </div>
        </div>
    );
}