# Career Platform Frontend

Frontend module of the Career Platform for the AITU Career Center and Employment Office.

This system is designed to support internship and employment communication between administrators and students.  
It provides role-based interfaces for student and admin workflows, including profile management, notifications, resume upload, templates management, filtering, inline editing, and authentication-aware routing.

---

## Tech Stack

- JavaScript
- React
- Vite
- React Router DOM
- Axios
- CSS
- PDF preview (`react-pdf`)
- Vercel (Cloud Frontend)

---

## Main Features

### Student features
- Login with email and password
- View personal profile
- Update internship company name
- Update practice status
- View notifications
- Mark notifications as read
- Upload PDF resume
- Replace uploaded resume
- Preview uploaded resume inside modal
- Download templates
- Change password
- Logout

### Admin features
- Login with email and password
- View all students
- Filter students by multiple parameters
- Sort students by selected columns
- Navigate through students table with pagination
- Edit student fields inline inside the table
- Send notifications to selected students
- Send notifications by current filters
- View student notification history
- Download student resume
- Manage templates:
  - upload template
  - replace template file
  - rename template
  - change template category
  - delete template
- Change password
- Logout

### Interface behavior
- Route-based page navigation for admin and student sections
- Polling for data refresh
- Drag & drop support for student CV upload
- Drag & drop support for admin template upload
- File format and size validation
- Role-based page protection
- Account dropdown and modal-based UI interactions

---

## Project Structure

```text
src
├── api
│   ├── adminApi.js
│   ├── authApi.js
│   ├── axios.js
│   └── studentApi.js
│
├── auth
│   └── auth.js
│
├── components
│   ├── admin
│   │   ├── AdminAccountDropdown.jsx
│   │   ├── AdminFiltersPanel.jsx
│   │   ├── AdminNotificationViewerModal.jsx
│   │   ├── AdminStudentsPagination.jsx
│   │   ├── AdminStudentsTable.jsx
│   │   ├── AdminTemplateCard.jsx
│   │   ├── AdminTemplatesSection.jsx
│   │   └── AdminTemplateUploadModal.jsx
│   │
│   ├── common
│   │   ├── AppHeader.jsx
│   │   ├── IconButton.jsx
│   │   ├── NotificationDropdown.jsx
│   │   ├── PageLoader.jsx
│   │   ├── RedDot.jsx
│   │   └── Sidebar.jsx
│   │
│   └── student
│       ├── StudentAccountDropdown.jsx
│       ├── StudentCvSection.jsx
│       ├── StudentCvUploadModal.jsx
│       ├── StudentPdfPreviewModal.jsx
│       ├── StudentProfileSection.jsx
│       └── StudentTemplatesSection.jsx
│
├── context
│   └── AuthContext.jsx
│
├── hooks
│   └── useClickOutside.js
│
├── layouts
│   ├── AdminLayout.jsx
│   ├── AuthLayout.jsx
│   └── StudentLayout.jsx
│
├── pages
│   ├── AdminDashboard.jsx
│   ├── LoginPage.jsx
│   └── StudentDashboard.jsx
│
├── router
│   ├── AppRouter.jsx
│   ├── ProtectedRoute.jsx
│   └── RoleProtectedRoute.jsx
│
├── utils
│   ├── fileUtils.js
│   ├── fileValidation.js
│   ├── formatDateTime.js
│   ├── formatPracticeStatus.js
│   └── getPracticeStatusRowStyle.js
│
├── App.css
├── admin.css
├── index.css
├── main.jsx
├── student.css
├── layout.css
└── theme.css
````

---

## Architecture Layers

### Pages

Contain the main page-level business logic and state orchestration.

Examples:

* `StudentDashboard`
* `AdminDashboard`
* `LoginPage`

### Components

Contain reusable UI blocks and section-level rendering logic.

Examples:

* `AdminStudentsTable`
* `AdminFiltersPanel`
* `AdminTemplatesSection`
* `StudentProfileSection`
* `StudentCvSection`
* `StudentTemplatesSection`

### Layouts

Provide common structural wrappers for pages.

Examples:

* `StudentLayout`
* `AdminLayout`
* `AuthLayout`

### Router

Contains route declarations and access guards.

Examples:

* `AppRouter`
* `ProtectedRoute`
* `RoleProtectedRoute`

### API

Contains all frontend HTTP request logic.

Examples:

* `adminApi`
* `studentApi`
* `authApi`
* `axios`

### Context

Contains shared frontend state.

Example:

* `AuthContext`

### Hooks

Contains reusable UI and behavior logic.

Example:

* `useClickOutside`

### Utility

Contains helper functions for formatting and validation.

Examples:

* `fileUtils`
* `fileValidation`
* `formatDateTime`
* `formatPracticeStatus`
* `getPracticeStatusRowStyle`

### Styling

Contains shared and role-specific CSS files.

Examples:

* `App.css`
* `admin.css`
* `student.css`
* `layout.css`
* `theme.css`
* `index.css`

---

## Routing

The frontend uses route-based navigation.

### Public routes

```text
/login
```

### Student routes

```text
/student/main
/student/resume
/student/templates
```

### Admin routes

```text
/admin/students
/admin/templates
```

### Route protection

* unauthenticated users are redirected to `/login`
* student-only pages are restricted to `STUDENT`
* admin-only pages are restricted to `ADMIN`

---

## Authentication and Authorization

Authentication is handled through the backend API with cookie-based session restoration.

### Login flow

1. User sends email and password from the login page
2. Frontend sends request to `/api/auth/login`
3. Backend authenticates the user and sets auth cookie
4. Frontend restores role through auth state
5. User is redirected to the correct dashboard

### Roles

* `ADMIN`
* `STUDENT`

### Frontend auth behavior

* authentication state is stored in `AuthContext`
* protected routes are controlled by `ProtectedRoute`
* role-based routing is controlled by `RoleProtectedRoute`
* logout is handled through backend logout request and frontend state reset

---

## Main UI Modules

### Student dashboard

Student dashboard is split into three main sections:

* `Profile`
* `CV`
* `Templates`

Implemented logic includes:

* company update
* practice status update
* notifications dropdown
* password change
* CV upload and replace
* PDF preview modal
* templates download

### Admin dashboard

Admin dashboard is split into two main sections:

* `Students`
* `Templates`

Implemented logic includes:

* students table
* filters panel
* notifications sending
* inline editing
* templates management
* account dropdown
* notification history viewer

---

## File Handling

### Student CV

Student CV supports:

* PDF-only upload
* drag & drop upload
* replace existing file
* preview inside modal
* validation by format
* validation by file size

### Templates

Admin templates support:

* PDF and DOCX upload
* drag & drop upload
* replace file
* rename display name
* change category
* delete template
* file size validation

---

## Polling and UI Refresh

The frontend uses polling for selected data refresh scenarios.

### Current behavior includes

* refreshing student profile data
* refreshing templates
* refreshing admin notification viewer
* refreshing students list in safe states

Polling is designed to avoid breaking active editing states.

---

## Validation

The frontend includes validation for:

* empty message in notifications
* empty or invalid password change fields
* invalid template file format
* oversized template file
* invalid CV file format
* oversized CV file
* company confirmation before saving on student profile
* GPA filter lower bound

---

## Styling

Styling is based on plain CSS and separated by role and responsibility.

### Main style files

* `App.css` → shared application styles
* `admin.css` → admin page styles
* `student.css` → student page styles
* `layout.css` → layout-related shared styles
* `theme.css` → theme variables and reusable visual settings
* `index.css` → base root styles

---

## Environment Variables

Frontend environment variables are configured through Vite.

Example:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### Example file

```text
.env.example
```

---

## Running the Project

### Requirements

* Node.js
* npm

### Step 1. Install dependencies

```bash
npm install
```

### Step 2. Configure environment variables

Create a local `.env` file and set:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### Step 3. Run the development server

```bash
npm run dev
```

### Step 4. Open the app

By default, Vite runs on:

```text
http://localhost:5173
```

---

## API Integration

The frontend communicates with backend REST API through centralized modules.

### Main API modules

* `authApi`
* `studentApi`
* `adminApi`

### Shared request configuration

* base URL is configured through `axios.js`
* credentials are sent with requests
* route behavior depends on backend auth state

---

## Notes

* frontend is structured around page orchestrators and UI child components
* `StudentDashboard` and `AdminDashboard` were refactored into container-style pages
* file and status formatting logic was moved into shared utils
* route state is handled through URL instead of local storage page keys
* frontend is designed for maintainability and future scaling
* frontend currently uses polling instead of WebSocket updates
* authentication behavior is aligned with backend cookie-based auth

---

## Current MVP Scope

Implemented:

* login page
* protected routing
* student dashboard
* admin dashboard
* notifications
* filtering and sorting
* inline editing
* CV upload and preview
* templates management
* password change
* logout
* UI decomposition into reusable components

Planned after MVP:

* OpenID integration
* WebSocket-based updates
* improved role-specific field visibility
* advanced progress tracking for internship workflow
* new internship/company/document domain model
* frontend support for extended student practice data

---

## Frontend Purpose

This frontend was designed as a maintainable and extendable MVP for long-term university use.
It serves as the user-facing layer of the Career Platform and is intended to support further backend integration, UI improvements, and post-MVP expansion.