import {formatDateTime} from "../../utils/formatDateTime";

export default function NotificationDropdown({
    title = "Notification",
    notifications = [],
    isOpen = false,
    onClose,
    onClearAll,
    renderNotification,
    emptyText = "No notifications",
}) {
    if (!isOpen) return null;

    return (
        <div className="app-notification-dropdown">
            <div className="app-notification-dropdown__header">
                <div className="app-notification-dropdown__title">{title}</div>

                <div className="app-notification-dropdown__actions">
                    {onClearAll && (
                        <button
                            type="button"
                            className="app-dropdown-action-btn"
                            onClick={onClearAll}
                        >
                            Mark all as read
                        </button>
                    )}
                    <button
                        type="button"
                        className="app-dropdown-close-btn"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>
            </div>

            <div className="app-notification-dropdown__body">
                {notifications.length === 0 ? (
                    <div className="app-notification-dropdown__empty">{emptyText}</div>
                ) : (
                    notifications.map((notification) => {
                        if (renderNotification) {
                            return renderNotification(notification);
                        }

                        return (
                            <div
                                key={notification.id}
                                className={`app-notification-item ${
                                    !notification.isRead ? "app-notification-item--unread" : ""
                                }`}
                            >
                                <p className="app-notification-item__message">
                                    {notification.message}
                                </p>
                                <p className="app-notification-item__meta">
                                    {formatDateTime(notification.createdAt)}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}