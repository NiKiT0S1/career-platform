/**
 * REST API for student actions:
 * profile access, updates, resume upload and preview, notifications, change password.
 */

package com.university.careerplatform.backend.controller;

import com.university.careerplatform.backend.dto.ChangePasswordRequest;
import com.university.careerplatform.backend.dto.CompanyUpdateRequest;
import com.university.careerplatform.backend.dto.PracticeStatusUpdateRequest;
import com.university.careerplatform.backend.entity.Notification;
import com.university.careerplatform.backend.entity.Student;
import com.university.careerplatform.backend.service.NotificationService;
import com.university.careerplatform.backend.service.ResumeService;
import com.university.careerplatform.backend.service.StudentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    private final StudentService studentService;
    private final NotificationService notificationService;
    private final ResumeService resumeService;

    public StudentController(StudentService studentService, NotificationService notificationService, ResumeService resumeService) {
        this.studentService = studentService;
        this.notificationService = notificationService;
        this.resumeService = resumeService;

    }

    @GetMapping("/me")
    public ResponseEntity<Student> getCurrentStudent(Authentication authentication) {
        try {
            String email = authentication.getName();
            Student student = studentService.getCurrentStudent(email);
            return ResponseEntity.ok(student);
        }
        catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

//    @GetMapping("/profile/{studentId}")
//    public ResponseEntity<Student> getStudentProfile(@PathVariable Long studentId) {
//        Optional<Student> student = studentService.getStudentById(studentId);
//
//        return student.map(ResponseEntity::ok).
//                orElseGet(() -> ResponseEntity.notFound().build());
//    }

//    @PutMapping("/company/{studentId}")
//    public ResponseEntity<Student> updateCompanyName(@PathVariable Long studentId,
//                                                     @RequestBody CompanyUpdateRequest request) {
//        try {
//            Student updatedStudent = studentService.updateCompanyName(studentId, request.getCompanyName());
//            return ResponseEntity.ok(updatedStudent);
//        }
//        catch (RuntimeException e) {
//            return ResponseEntity.notFound().build();
//        }
//    }
    @PutMapping("/company")
    public ResponseEntity<Student> updateCompanyName(Authentication authentication,
                                                     @RequestBody CompanyUpdateRequest request) {
        try {
            String email = authentication.getName();
            Student updatedStudent = studentService.updateCompanyByEmail(email, request.getCompanyName());
            return ResponseEntity.ok(updatedStudent);
        }
        catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

//    @PutMapping("/practice-status/{studentId}")
//    public ResponseEntity<Student> updatePracticeStatus(@PathVariable Long studentId,
//                                                        @RequestBody PracticeStatusUpdateRequest request) {
//        try {
//            Student updatedStudent = studentService.updatePracticeStatus(studentId, request.getPracticeStatus());
//            return ResponseEntity.ok(updatedStudent);
//        }
//        catch (RuntimeException e) {
//            return ResponseEntity.notFound().build();
//        }
//    }
    @PutMapping("/practice-status")
    public ResponseEntity<Student> updatePracticeStatus(Authentication authentication,
                                                        @RequestBody PracticeStatusUpdateRequest request) {
        try {
            String email = authentication.getName();
            Student updatedStudent = studentService.updatePracticeStatusByEmail(email, request.getPracticeStatus());
            return ResponseEntity.ok(updatedStudent);
        }
        catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

//    @GetMapping("/notifications/{studentId}")
//    public ResponseEntity<List<Notification>> getStudentNotifications(@PathVariable Long studentId) {
//        List<Notification> notifications = notificationService.getNotificationsByStudentId(studentId);
//        return ResponseEntity.ok(notifications);
//    }
    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getStudentNotifications(Authentication authentication) {
        String email = authentication.getName();
        List<Notification> notifications = notificationService.getNotificationsByStudentEmail(email);
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/notifications/read/{notificationId}")
    public ResponseEntity<Notification> markNotificationAsRead(@PathVariable Long notificationId) {
        try {
            Notification notification = notificationService.markAsRead(notificationId);
            return ResponseEntity.ok(notification);
        }
        catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

//    @PutMapping("/notifications/read-all/{studentId}")
//    public ResponseEntity<String> markAllNotificationsAsRead(@PathVariable Long studentId) {
//        try {
//            notificationService.markAllAsRead(studentId);
//            return ResponseEntity.ok("All notifications marked as read");
//        }
//        catch (RuntimeException e) {
//            return ResponseEntity.badRequest().body(e.getMessage());
//        }
//    }
    @PutMapping("/notifications/read-all")
    public ResponseEntity<String> markAllNotificationsAsRead(Authentication authentication) {
        try {
            String email = authentication.getName();
            notificationService.markAllAsReadByEmail(email);
            return ResponseEntity.ok("All notifications marked as read");
        }
        catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

//    @PostMapping(value = "/resume/{studentId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ResponseEntity<Student> uploadResume(@PathVariable Long studentId,
//                                                @RequestParam("file") MultipartFile file) {
//        try {
//            Student updatedStudent = resumeService.uploadResume(studentId, file);
//            return ResponseEntity.ok(updatedStudent);
//        }
//        catch (RuntimeException e) {
//            return ResponseEntity.badRequest().build();
//        }
//        catch (Exception e) {
//            return ResponseEntity.internalServerError().build();
//        }
//    }
    @PostMapping(value = "/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Student> uploadResume(Authentication authentication,
                                                @RequestParam("file") MultipartFile file) {
        try {
            String email = authentication.getName();
            Student updatedStudent = resumeService.uploadResumeByEmail(email, file);
            return ResponseEntity.ok(updatedStudent);
        }
        catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

//    @GetMapping("/resume/{studentId}")
//    public ResponseEntity<Resource> previewResume(@PathVariable Long studentId) {
//        try {
//            Resource resource = resumeService.downloadResume(studentId);
//            return ResponseEntity.ok()
//                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"student-resume.pdf\"")
//                    .contentType(MediaType.APPLICATION_PDF)
//                    .body(resource);
//        }
//        catch (RuntimeException e) {
//            return ResponseEntity.notFound().build();
//        }
//        catch (Exception e) {
//            return ResponseEntity.internalServerError().build();
//        }
//    }
    @GetMapping("/resume")
    public ResponseEntity<Resource> previewResume(Authentication authentication) {
        try {
            String email = authentication.getName();
            Resource resource = resumeService.downloadResumeByEmail(email);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"student-resume.pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);
        }
        catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/contracts/three-sided")
    public ResponseEntity<Resource> downloadThreeSidedContracts() {
        try {
            Resource resource = resumeService.downloadContractTemplate("three-sided-contract.docx");
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"three-sided-contract.docx\"")
                    .contentType(MediaType.parseMediaType(
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                    .body(resource);
        }
        catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

//    @PutMapping("/change-password/{studentId}")
//    public ResponseEntity<String> changePassword(@PathVariable Long studentId,
//                                                 @RequestBody ChangePasswordRequest request) {
//        try {
//            studentService.changePassword(
//                    studentId,
//                    request.getCurrentPassword(),
//                    request.getNewPassword()
//            );
//            return ResponseEntity.ok("Password changed successfully");
//        }
//        catch (RuntimeException e) {
//            return ResponseEntity.badRequest().body(e.getMessage());
//        }
//    }
    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(Authentication authentication,
                                                 @RequestBody ChangePasswordRequest request) {
        try {
            String email = authentication.getName();
            studentService.changePasswordByEmail(
                    email,
                    request.getCurrentPassword(),
                    request.getNewPassword()
            );
            return ResponseEntity.ok("Password changed successfully");
        }
        catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
