/**
 * ================================
 * main
 * ================================
 * Frontend entry point.
 *
 * Responsibilities:
 * - Mounts React application to DOM
 * - Imports global styles
 *
 * Notes:
 * - Starts the frontend application
 * ================================
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";

import "./styles/theme.css";
import "./styles/layout.css";
import "./styles/student.css";
import "./styles/admin.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
