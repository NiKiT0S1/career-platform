export default function IconButton({
    children,
    onClick,
    title,
    isActive = false,
    hasDot = false,
    className = "",
    type = "button",
}) {
    return (
        <button
            type={type}
            className={`app-icon-button ${isActive ? "app-icon-button--active" : ""} ${className}`}
            onClick={onClick}
            title={title}
        >
            {children}
            {hasDot && <span className="app-red-dot" />}
        </button>
    );
}