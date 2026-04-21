/**
 * ================================
 * AppHeader
 * ================================
 * Shared header component.
 *
 * Responsibilities:
 * - Displays page header area
 * - Shows user/account controls
 * - Shows notifications toggle when needed
 *
 * Notes:
 * - Reused in admin and student layouts
 * ================================
 */

import { useRef, useEffect } from "react";
import IconButton from "./IconButton";
import NotificationDropdown from "./NotificationDropdown";

export default function AppHeader({
    actions = [],

    notificationsOpen = false,
    onCloseNotifications,
    notifications = [],
    notificationTitle = "Notifications",
    onClearNotifications,
    renderNotification,

    accountOpen = false,
    onCloseAccount,
    renderAccountDropdown,
}) {
    const headerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!headerRef.current) return;

            if (!headerRef.current.contains(event.target)) {
                onCloseNotifications?.();
                onCloseAccount?.();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onCloseNotifications, onCloseAccount]);

    return (
        <header className="app-header" ref={headerRef}>
            <div className="app-header__actions">
                {actions.map((action) => (
                    <IconButton
                        key={action.key}
                        onClick={action.onClick}
                        title={action.title}
                        isActive={action.isActive}
                        hasDot={action.hasDot}
                    >
                        {action.icon}
                    </IconButton>
                ))}

                <NotificationDropdown
                    title={notificationTitle}
                    notifications={notifications}
                    isOpen={notificationsOpen}
                    onClose={onCloseNotifications}
                    onClearAll={onClearNotifications}
                    renderNotification={renderNotification}
                />

                {accountOpen && renderAccountDropdown && (
                    <div className="app-account-dropdown">
                        {renderAccountDropdown()}
                    </div>
                )}
            </div>
        </header>
    );
}