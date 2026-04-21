# Career Platform

Full-stack web platform for managing student internships and communication between students and the Career Center of Astana IT University (AITU).

This system is designed as an MVP solution to simplify internship tracking, communication, document handling, and administrative workflows.

---

## 🌐 Live Demo

Frontend deployed on Vercel:

👉 https://digital-career-platform.vercel.app

---

## 📦 Project Structure

```

career-platform
├── backend      # Spring Boot backend (Java)
├── frontend     # React frontend (Vite)
├── database     # Database-related files (SQL, CSV, etc.)
└── README.md

````

---

## 🧠 System Overview

The platform consists of two main parts:

### Backend
Handles:
- business logic
- database operations
- authentication and authorization
- file storage (Cloudflare R2)
- REST API

### Frontend
Handles:
- user interface
- interaction logic
- routing and state management
- API communication

---

## ⚙️ Tech Stack

### Backend
- Java
- Spring Boot
- Spring Security
- JWT / Cookie-based auth
- PostgreSQL
- Hibernate / JPA
- Cloudflare R2 (file storage)
- Neon (cloud database)
- Koyeb (deployment)

### Frontend
- React
- Vite
- React Router
- Axios
- CSS
- Vercel (deployment)

---

## 👤 User Roles

### Student
- View profile
- Upload and manage CV
- View notifications
- Download templates
- Track internship status
- Change password

### Admin
- View all students
- Filter and search students
- Edit student data inline
- Send notifications
- Manage templates
- View student CV
- Change password

---

## 🚀 Key Features

### Student Features
- Profile management
- CV upload and preview
- Template download
- Notification system
- Password management

### Admin Features
- Students table with:
  - filtering
  - sorting
  - pagination
  - inline editing
- Notification system:
  - send to selected students
  - send by filters
- Templates management:
  - upload
  - replace
  - rename
  - delete

---

## 🔐 Authentication & Security

- Role-based access control (`ADMIN`, `STUDENT`)
- Password hashing (BCrypt)
- Authentication via backend (HttpOnly cookies)
- Protected routes on frontend

---

## 📂 File Storage

### Resumes
- Stored in Cloudflare R2
- PDF-only upload
- Replace support

### Templates
- Stored in Cloudflare R2
- PDF / DOCX support
- Managed by admin

---

## 🗄️ Database

Uses PostgreSQL.

Main tables:
- students
- admins
- notifications
- template_documents

---

## 🔄 Data Flow

1. User interacts with frontend (React)
2. Frontend sends request via Axios
3. Backend processes request (Spring Boot)
4. Backend interacts with PostgreSQL / R2
5. Response is returned to frontend
6. UI updates

---

## 🛠️ Running the Project

### Backend

```bash
cd backend
````

Follow instructions in:

```
backend/README.md
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🌱 Environment Setup

### Backend

Configured via environment variables:

* database credentials
* JWT secret
* R2 storage credentials

See:

```
backend/README.md
```

### Frontend

Create `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## 📈 Current MVP Scope

Implemented:

* full backend architecture
* frontend dashboards (student + admin)
* authentication
* notifications
* CV upload system
* templates management
* filtering and inline editing

---

## 🚧 Planned Features

* OpenID (Outlook login)
* WebSocket real-time updates
* Internship workflow tracking
* Company database integration
* Document workflow automation
* Advanced filtering and analytics

---

## 🎯 Project Purpose

This platform was developed as part of a university production practice project.

Goal:

* simplify internship tracking
* improve communication between students and the Career Center
* provide a scalable system for long-term use

---

## 📌 Notes

* Frontend and backend are fully separated
* System is designed for scalability
* Current version is MVP, ready for further expansion

---

## 👨‍💻 Author

Nikita Bobylev
Astana IT University
Software Engineering Student