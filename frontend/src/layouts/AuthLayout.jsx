export default function AuthLayout({children}) {
    return (
        <div className="app-auth-shell">
            <div className="app-auth-card">
                {children}
            </div>
        </div>
    );
}