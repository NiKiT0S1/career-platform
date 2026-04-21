import { formatDateTime } from "../../utils/formatDateTime";

export default function AdminNotificationViewerModal({
    notificationViewerOpen,
    currentStudentName,
    currentStudentNotifications,
    handleCloseNotificationViewer,
}) {
    if (!notificationViewerOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.45)",
                backdropFilter: "blur(4px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    position: "relative",
                    width: "85%",
                    height: "85%",
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    padding: "16px",
                }}
            >
                <button
                    onClick={handleCloseNotificationViewer}
                    style={{
                        position: "absolute",
                        top: "-14px",
                        right: "-14px",
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        border: "none",
                        backgroundColor: "#ffffff",
                        color: "#222",
                        fontSize: "26px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                        zIndex: 1001,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        lineHeight: "1",
                    }}
                >
                    ×
                </button>

                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        overflowY: "auto",
                        paddingRight: "8px",
                    }}
                >
                    <h3 style={{ marginTop: 0, marginBottom: "20px" }}>
                        Notifications: {currentStudentName}
                    </h3>

                    {currentStudentNotifications.length === 0 ? (
                        <p>No notifications</p>
                    ) : (
                        currentStudentNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "12px",
                                    marginBottom: "12px",
                                    borderRadius: "8px",
                                }}
                            >
                                <p><strong>Message:</strong> {notification.message}</p>
                                <p><strong>Created at:</strong> {formatDateTime(notification.createdAt)}</p>
                                <p><strong>Status:</strong> {notification.isRead ? "Read" : "Unread"}</p>
                                <p><strong>Read at:</strong> {formatDateTime(notification.readAt)}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}