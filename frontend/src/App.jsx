/**
 * ================================
 * App
 * ================================
 * Root frontend component.
 *
 * Responsibilities:
 * - Wraps the application with global providers
 * - Renders the main router
 *
 * Notes:
 * - Entry point for application composition
 * ================================
 */

import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./router/AppRouter";

function App() {
    return (
      <AuthProvider>
          <AppRouter />
      </AuthProvider>
    );
}

export default App;