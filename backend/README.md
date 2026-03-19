# Career Platform Backend

Backend module of the Career Platform for the AITU Career Center and Employment Office.

This system is designed to support internship and employment communication between administrators and students.  
It provides student profile management, filtering, notifications, resume upload, contract template download, JWT-based authentication, and role-based access control.

---

## Tech Stack

- Java
- Spring Boot
- Spring Data JPA
- Spring Security
- JWT
- PostgreSQL
- Lombok
- Maven

---

## Main Features

### Student features
- Login with email and password
- View personal profile
- View GPA
- Update internship company name
- Update practice status
- View notifications
- Mark notifications as read
- Upload PDF resume
- Download internship contract template
- Change password

### Admin features
- Login with email and password
- View all students
- Filter students by multiple parameters
- Send notifications to one or multiple students
- Download student resume
- Show notification's story with each student

### Security
- JWT authentication
- Role-based access control
- BCrypt password hashing

---

## Project Structure

```text
src/main/java/com/university/careerplatform/backend
├── config
│   └──CorsConfig.java
│
├── controller
│   ├── AdminController.java
│   ├── AuthController.java
│   └── StudentController.java
│
├── dto
│   ├── AuthResponse.java
│   ├── ChangePasswordRequest.java
│   ├── CompanyUpdateRequest.java
│   ├── LoginRequest.java
│   ├── PracticeStatusUpdateRequest.java
│   ├── SendNotificationByFilterRequest.java
│   └── SendNotificationRequest.java
│
├── entity
│   ├── Admin.java
│   ├── Notification.java
│   └── Student.java
│
├── repository
│   ├── AdminRepository.java
│   ├── NotificationRepository.java
│   └── StudentRepository.java
│
├── security
│   ├── JwtAuthenticationFilter.java
│   ├── JwtService.java
│   └── SecurityConfig.java
│
├── service
│   ├── AdminService.java
│   ├── AuthService.java
│   ├── NotificationService.java
│   ├── ResumeService.java
│   └── StudentService.java
│
├── specification
│   └── StudentSpecification.java
│
├── util
│   └── PasswordGenerator.java
│
└── BackendApplication.java
````

---

## Architecture Layers

### Entity

Represents database tables and main domain objects.

Examples:

* `Student`
* `Admin`
* `Notification`

### Repository

Provides database access through Spring Data JPA.

Examples:

* `StudentRepository`
* `AdminRepository`
* `NotificationRepository`

### Service

Contains the main business logic of the platform.

Examples:

* `StudentService`
* `AdminService`
* `NotificationService`
* `ResumeService`
* `AuthService`

### Controller

Exposes REST API endpoints for frontend and external requests.

Examples:

* `StudentController`
* `AdminController`
* `AuthController`

### DTO

Used for request and response payloads.

Examples:

* `LoginRequest`
* `AuthResponse`
* `ChangePasswordRequest`
* `CompanyUpdateRequest`
* `SendNotificationRequest`
* `SendNotificationByFilterRequest`
* `PracticeStatusUpdateRequest`

### Security

Contains JWT logic and Spring Security configuration.

Examples:

* `JwtService`
* `JwtAuthenticationFilter`
* `SecurityConfig`

### Specification

Contains dynamic filtering logic for multi-parameter student search.

Example:

* `StudentSpecification`

### Utility

Contains helper and technical classes.

Example:

* `PasswordGenerator`

---

## Database

The backend uses PostgreSQL.

### Main tables

* `students`
* `admins`
* `notifications`

### Students table includes

* full name
* group name
* course
* educational program
* email
* phone
* GPA
* company name
* practice status
* password
* resume path

### Notifications table includes

* message
* read status
* creation date
* student reference

---

## Authentication and Authorization

Authentication is implemented with JWT.

### Login flow

1. User sends email and password to `/api/auth/login`
2. Backend checks the user in `admins` and `students`
3. If credentials are valid, backend returns JWT token and user role
4. Token must be sent in request headers:

```http
Authorization: Bearer <token>
```

### Roles

* `ADMIN`
* `STUDENT`

### Access rules

* `/api/auth/**` → public
* `/api/admin/**` → ADMIN only
* `/api/student/**` → STUDENT only

### Password security

Passwords are stored in the database as BCrypt hashes.

---

## File Storage

Uploaded files are stored in local backend folders.

### Resume storage

```text
uploads/resumes
```

### Contract templates

```text
uploads/contracts
```

### Current contract template

* `three-sided-contract.docx`

---

## Configuration

Main configuration is stored in:

```text
src/main/resources/application.properties
```

It contains:

* database connection settings
* JWT secret and expiration settings
* file storage paths
* multipart upload limits

Example configuration:

```properties
spring.application.name=backend

spring.datasource.url=jdbc:postgresql://localhost:5432/career_platform
spring.datasource.username=postgres
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

server.port=8080

jwt.secret=your-super-secret-key-your-super-secret-key
jwt.expiration=86400000

file.upload-dir=uploads/resumes
file.contracts-dir=uploads/contracts

spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

---

## Running the Project

### Requirements

* Java 17+ or compatible version
* Maven
* PostgreSQL

### Step 1. Create PostgreSQL database

```sql
CREATE DATABASE career_platform;
```

### Step 2. Configure `application.properties`

Update:

* database username
* database password
* JWT secret

### Step 3. Run the application

You can run the project:

* from IntelliJ IDEA
* or using Maven

---

## Main API Endpoints

### Authentication

```http
POST /api/auth/login
```

### Student API

```http
GET    /api/student/me
GET    /api/student/profile/{studentId}
PUT    /api/student/company/{studentId}
PUT    /api/student/practice-status/{studentId}
GET    /api/student/notifications/{studentId}
PUT    /api/student/notifications/read/{notificationId}
PUT    /api/student/notifications/read-all/{notificationId}
POST   /api/student/resume/{studentId}
GET    /api/student/resume/{studentId}
GET    /api/student/contracts/three-sided
PUT    /api/student/change-password/{studentId}
```

### Admin API

```http
GET    /api/admin/me
GET    /api/admin/students
GET    /api/admin/students/filter
POST   /api/admin/notifications/send
POST   /api/admin/notifications/send-by-filter
GET    /api/admin/students/{studentId}/resume
GET    /api/admin/students/{studentId}/notifications
```

---

## Filtering

The admin API supports multi-parameter student filtering.

Supported parameters:

* `educationalProgram`
* `course`
* `practiceStatus`
* `minGpa`

Example:

```http
GET /api/admin/students/filter?educationalProgram=SE&course=2&practiceStatus=NOT_FOUND&minGpa=3.0
```

---

## Notes

* Student passwords and admin passwords are stored as BCrypt hashes
* JWT is used instead of server-side sessions
* Notifications are linked to students through foreign key
* Contract template is downloaded as `.docx`
* Resume upload currently supports PDF files only
* Student filtering supports multiple parameters simultaneously
* Current logout logic is expected to be handled on the frontend by removing JWT token

---

## Current MVP Scope

Implemented:

* backend architecture
* PostgreSQL integration
* student import from Excel/CSV
* student and admin APIs
* notifications
* resume upload and download
* contract template download
* JWT authentication
* BCrypt password hashing
* role-based access control
* multi-parameter student filtering

Planned after MVP:

* graduate module
* yearly student list update
* confirmation-based notifications
* Outlook/email integration
* better contact management
* contract auto-generation
* graduate access model

---

## Backend Purpose

This backend was designed as a maintainable and extendable MVP for long-term university use.
It serves as the core business and data layer of the Career Platform and is intended to support further frontend and post-MVP development.

