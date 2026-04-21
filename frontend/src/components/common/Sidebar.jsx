/**
 * ================================
 * Sidebar
 * ================================
 * Shared sidebar navigation component.
 *
 * Responsibilities:
 * - Displays navigation items
 * - Highlights active page
 * - Triggers page change actions
 *
 * Notes:
 * - Reused in admin and student layouts
 * ================================
 */

export default function Sidebar({
    navItems = [],
    activeKey = "",
    onNavigate,
    onLogout,
    isStudent = false,
    isAdmin = false,
}) {
    return (
        <aside className={`app-sidebar ${isStudent ? "student-sidebar" : ""}`}>
            <div className="student-sidebar__top">
                <div className="student-sidebar__logo">
                    <img src="/aitu-white-logo.png" alt="AITU" />
                </div>

                <div className="app-sidebar__nav">
                    {navItems.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            className={`app-sidebar__item ${
                                activeKey === item.key ? "app-sidebar__item--active" : ""
                            }`}
                            onClick={() => onNavigate?.(item.key)}
                        >
                            <span className="app-sidebar__item-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="student-sidebar__bottom">
                <button
                    type="button"
                    className="app-sidebar__item app-sidebar__logout"
                    onClick={onLogout}
                >
                    <span className="app-sidebar__item-icon">↪</span>
                    <span>Log Out</span>
                </button>
            </div>
        </aside>
    );
}