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
- Cloudflare R2 (S3-compatible object storage)
- Neon (Cloud DB)
- Koyeb (Cloud Backend)

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
- Download templates like resume or three-sided contracts
- Change password

### Admin features
- Login with email and password
- View all students
- Filter students by multiple parameters
- Send notifications to one or multiple students
- Download student resume
- Manage upload template logic (upload template, replace file, change display name, delete template)
- Show notification's story with each student
- Change password

### Security
- JWT authentication
- Role-based access control
- BCrypt password hashing

---

## Project Structure

```text
src/main/java/com/university/careerplatform/backend
├── config
│   ├── R2Config.java
│   └── CorsConfig.java
│
├── controller
│   ├── AdminController.java
│   ├── AuthController.java
│   ├── HealthController.java
│   └── StudentController.java
│
├── dto
│   ├── AuthResponse.java
│   ├── ChangePasswordRequest.java
│   ├── CompanyUpdateRequest.java
│   ├── ForgotPasswordRequest.java
│   ├── LoginRequest.java
│   ├── PracticeSettingsRequest.java
│   ├── PracticeStatusUpdateRequest.java
│   ├── ResetPasswordRequest.java
│   ├── SendNotificationByFilterRequest.java
│   ├── SendNotificationRequest.java
│   ├── UpdatePracticeRequest.java
│   ├── UpdateStudentFieldRequest.java
│   ├── UpdateTemplateCategoryRequest.java
│   ├── UpdateTemplateDisplayNameRequest.java
│   └── VerifyResetCodeRequest.java
│
├── entity
│   ├── Admin.java
│   ├── CompanyDirectory.java
│   ├── Notification.java
│   ├── PasswordResetCode.java
│   ├── PracticeSettings.java
│   ├── Student.java
│   ├── StudentPractice.java
│   └── TemplateDocument.java
│
├── model
│   ├── CompanyType.java
│   ├── DocumentType.java
│   ├── PracticeMode.java
│   ├── PracticeStatus.java
│   └── TemplateCategory.java
│
├── repository
│   ├── AdminRepository.java
│   ├── CompanyDirectoryRepository.java
│   ├── NotificationRepository.java
│   ├── PasswordResetRepository.java
│   ├── PracticeSettingsRepository.java
│   ├── StudentPracticeRepository.java
│   ├── StudentRepository.java
│   └── TemplateDocumentRepository.java
│
├── security
│   ├── JwtAuthenticationFilter.java
│   ├── JwtService.java
│   └── SecurityConfig.java
│
├── service
│   ├── AdminService.java
│   ├── AuthService.java
│   ├── CompanyDirectoryService.java
│   ├── EmailService.java
│   ├── NotificationService.java
│   ├── PracticeSettingsService.java
│   ├── ResumeService.java
│   ├── StudentExportService.java
│   ├── StudentPracticeService.java
│   ├── StudentService.java
│   └── TemplateService.java
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
* `TemplateDocument`
* `StudentPractice`
* `CompanyDirectory`
* `PracticeSettings`
* `PasswordResetCode`

### Repository

Provides database access through Spring Data JPA.

Examples:

* `StudentRepository`
* `AdminRepository`
* `NotificationRepository`
* `TemplateDocumentRepository`
* `CompanyDirectoryRepository`
* `StudentPracticeRepository`
* `PracticeSettingsRepository`
* `PasswordResetRepository`

### Service

Contains the main business logic of the platform.

Examples:

* `StudentService`
* `AdminService`
* `NotificationService`
* `ResumeService`
* `AuthService`
* `TemplateService`
* `CompanyDirectoryService`
* `StudentPracticeService`
* `PracticeSettingsService`
* `StudentExportService`
* `EmailService`

### Controller

Exposes REST API endpoints for frontend and external requests.

Examples:

* `StudentController`
* `AdminController`
* `AuthController`
* `HealthController`

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
* `UpdateStudentFieldRequest`
* `UpdateTemplateDisplayNameRequest`
* `UpdateTemplateCategoryRequest`
* `UpdatePracticeRequest`
* `PracticeSettingsRequest`
* `ForgotPasswordRequest`
* `ResetPasswordRequest`
* `VerifyResetCodeRequest`

### Security

Contains JWT processing, request authentication, and role-based access configuration.

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

### Configuration

Contains infrastructure and integration configuration classes.

Examples:

* `CorsConfig`
* `R2Config`

### Model

Contains supporting domain models and enums used across the application.

Example:

* `PracticeStatus`
* `TemplateCategory`
* `CompanyType`
* `DocumentType`
* `PracticeMode`

---

## Database

The backend uses PostgreSQL.

### Main tables

* `students`
* `admins`
* `notifications`
* `template_documents`

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

### Template Documents table includes

* category
* content type
* display name
* file name
* storage key
* creation date
* update date

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

### Resume storage

Student resumes are stored in **Cloudflare R2 (S3-compatible cloud storage)**.

Features:
- secure cloud-based storage
- automatic deletion of old resume versions on update
- unique filename generation based on student data
- accessible for both student preview and admin download

### Templates

Templates (resume and contract) are stored in **Cloudflare R2 (S3-compatible cloud storage)**.

Features:
- secure cloud-based storage
- automatic deletion of old resume versions on update
- accessible for both student download and admin manage

### Current templates

* `three-sided-contract.docx`
* `resume-template.docx`

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

### Environment Variables

Sensitive data is not stored directly in the repository.

The following environment variables must be configured:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_ENDPOINT`

Example (local development via IntelliJ):

```text
R2_ACCESS_KEY_ID=xxx;
R2_SECRET_ACCESS_KEY=xxx;
R2_BUCKET_NAME=career-platform-resumes;
R2_ENDPOINT=https://xxxx.r2.cloudflarestorage.com
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
GET    /api/admin/me
POST   /api/auth/login
POST   /api/auth/logout
```

### Student API

```http
GET    /api/student/me
PUT    /api/student/company
PUT    /api/student/practice-status
GET    /api/student/notifications
PUT    /api/student/notifications/read/{notificationId}
PUT    /api/student/notifications/read-all
POST   /api/student/resume
GET    /api/student/resume
GET    /api/student/templates
GET    /api/student//templates/{templateId}
PUT    /api/student/change-password
```

### Admin API

```http
GET      /api/admin/me
GET      /api/admin/students
GET      /api/admin/students/filter
GET      /api/admin/students/educational-programs
GET      /api/admin/students/groups
POST     /api/admin/notifications/send
POST     /api/admin/notifications/send-by-filter
GET      /api/admin/students/{studentId}/resume
GET      /api/admin/students/{studentId}/notifications
PUT      /api/admin/change-password
POST     /api/admin/students/sync-practice-statuses
GET      /api/admin/templates
POST     /api/admin/templates
PUT      /api/admin/templates/{templateId}/display-name
PUT      /api/admin/templates/{templateId}/category
PUT      /api/admin/templates/{templateId}/file
DELETE   /api/admin/templates/{templateId}
PATCH    /api/admin/students/{studentId}
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

## Searching

The admin API supports search placeholder by students.

---

## Notes

* Student passwords and admin passwords are stored as BCrypt hashes
* JWT is used instead of server-side sessions
* Notifications are linked to students through foreign key
* Contract template is downloaded as `.docx`
* Resume upload currently supports PDF files only
* Student filtering supports multiple parameters simultaneously
* Current logout logic is expected to be handled on the frontend by removing JWT token
* Sensitive credentials are managed via environment variables and are not stored in the repository

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

