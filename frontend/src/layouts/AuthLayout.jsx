/**
 * ================================
 * AuthLayout
 * ================================
 * Layout for authentication pages.
 *
 * Responsibilities:
 * - Provides centered container for login UI
 * - Keeps auth page styling consistent
 *
 * Notes:
 * - Used by LoginPage
 * ================================
 */

export default function AuthLayout({children}) {
    return (
        <div className="app-auth-shell">
            <div className="app-auth-card">
                {children}
            </div>
        </div>
    );
}