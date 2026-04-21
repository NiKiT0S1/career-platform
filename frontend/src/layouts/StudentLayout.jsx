/**
 * ================================
 * StudentLayout
 * ================================
 * Shared layout for student pages.
 *
 * Responsibilities:
 * - Renders sidebar and header
 * - Handles account and notifications dropdown rendering
 * - Displays active student page content
 *
 * Notes:
 * - Used by StudentDashboard
 * ================================
 */

import StudentSidebar from "../components/common/Sidebar";
import AppHeader from "../components/common/AppHeader";

export default function StudentLayout({
    children,
    activePage,
    onChangePage,

    notifications = [],
    hasUnreadNotifications = false,
    notificationsOpen = false,
    onToggleNotifications,
    onCloseNotifications,
    onClearNotifications,
    renderNotification,

    accountOpen = false,
    onToggleAccount,
    onCloseAccount,
    renderAccountDropdown,

    onLogout,
}) {
    const navItems = [
        { key: "main", label: "Profile", icon: "👤" },
        { key: "resume", label: "CV", icon: "📄" },
        { key: "templates", label: "Templates", icon: "🧾" },
    ];

    const headerActions = [
        {
            key: "notifications",
            title: "Notifications",
            isActive: notificationsOpen,
            hasDot: hasUnreadNotifications,
            onClick: onToggleNotifications,
            icon: "🔔",
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
        <div className="app-shell student-shell">
            <StudentSidebar
                navItems={navItems}
                activeKey={activePage}
                onNavigate={onChangePage}
                onLogout={onLogout}
                isStudent
            />

            <div className="app-main student-main-layout">
                <div className="app-content-card student-content-card">
                    <AppHeader
                        actions={headerActions}
                        notificationsOpen={notificationsOpen}
                        onCloseNotifications={onCloseNotifications}
                        notifications={notifications}
                        onClearNotifications={onClearNotifications}
                        renderNotification={renderNotification}
                        accountOpen={accountOpen}
                        onCloseAccount={onCloseAccount}
                        renderAccountDropdown={renderAccountDropdown}
                    />

                    {children}
                </div>
            </div>
        </div>
    );
}