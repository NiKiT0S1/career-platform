/**
 * REST API for administrator actions:
 * student filtering, searching, notifications, management templates, change admin password.
 */

package com.university.careerplatform.backend.controller;

import com.university.careerplatform.backend.dto.*;
import com.university.careerplatform.backend.entity.Admin;
import com.university.careerplatform.backend.entity.Notification;
import com.university.careerplatform.backend.entity.Student;
import com.university.careerplatform.backend.entity.TemplateDocument;
import com.university.careerplatform.backend.model.TemplateCategory;
import com.university.careerplatform.backend.service.*;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final StudentService studentService;
    private final NotificationService notificationService;
    private final ResumeService resumeService;
    private final AdminService adminService;
    private final TemplateService templateService;

    public AdminController(StudentService studentService,
                           NotificationService notificationService,
                           ResumeService resumeService, AdminService adminService, TemplateService templateService) {
        this.studentService = studentService;
        this.notificationService = notificationService;
        this.resumeService = resumeService;
        this.adminService = adminService;
        this.templateService = templateService;
    }

    @GetMapping("/me")
    public ResponseEntity<Admin> getCurrentAdmin(Authentication authentication) {
        String email = authentication.getName();

        return adminService.getAdminByEmail(email)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/students")
    public ResponseEntity<Page<Student>> getStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir
    ) {
        return ResponseEntity.ok(studentService.getStudentPage(page, size, sortBy, sortDir));
    }

    @GetMapping("/students/filter")
    public ResponseEntity<Page<Student>> filterStudents(
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) String educationalProgram,
            @RequestParam(required = false) String groupName,
            @RequestParam(required = false) Integer course,
            @RequestParam(required = false) String practiceStatus,
            @RequestParam(required = false) Double minGpa,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(
                studentService.filterStudents(
                        fullName,
                        educationalProgram,
                        groupName,
                        course,
                        practiceStatus,
                        minGpa,
                        sortBy,
                        sortDir,
                        page,
                        size
                )
        );
    }

    @GetMapping("/students/educational-programs")
    public ResponseEntity<List<String>> getEducationalPrograms() {
        return ResponseEntity.ok(studentService.getAllEducationalPrograms());
    }

    @GetMapping("/students/groups")
    public ResponseEntity<List<String>> getGroupNames(
            @RequestParam(required = false) String educationalProgram
    ) {
        return ResponseEntity.ok(studentService.getGroupNamesByEducationalProgram(educationalProgram));
    }

    @PostMapping("/notifications/send")
    public ResponseEntity<String> sendNotification(@RequestBody SendNotificationRequest request) {
        if (request.getStudentIds() == null || request.getStudentIds().isEmpty()) {
            return ResponseEntity.badRequest().body("Student IDs list cannot be empty");
        }
        if (request.getMessage() == null || request.getMessage().isEmpty()) {
            return ResponseEntity.badRequest().body("Message cannot be empty");
        }

        notificationService.sendNotificationToMultipleStudents(
                request.getStudentIds(),
                request.getMessage()
        );

        return ResponseEntity.ok("Notification sent successfully");
    }

    @PostMapping("/notifications/send-by-filter")
    public ResponseEntity<String> sendNotificationByFilter(
            @RequestBody SendNotificationByFilterRequest request
    ) {
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            return ResponseEntity.badRequest().body("Message cannot be empty");
        }

        List<Student> filteredStudents = studentService.getAllFilteredStudents(
                request.getFullName(),
                request.getEducationalProgram(),
                request.getGroupName(),
                request.getCourse(),
                request.getPracticeStatus(),
                request.getMinGpa()
        );

        if (filteredStudents.isEmpty()) {
            return ResponseEntity.badRequest().body("No students found for current filters");
        }

        List<Long> studentIds = filteredStudents.stream()
                .map(Student::getId)
                .toList();

        notificationService.sendNotificationToMultipleStudents(studentIds, request.getMessage());

        return ResponseEntity.ok("Notification sent to filtered students successfully");
    }

    @GetMapping("/students/{studentId}/resume")
    public ResponseEntity<Resource> downloadStudentResume(@PathVariable Long studentId) {
        try {
            Resource resource = resumeService.downloadResume(studentId);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"student-resume.pdf\"")
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

    @GetMapping("/students/{studentId}/notifications")
    public ResponseEntity<List<Notification>> getStudentNotifications(@PathVariable Long studentId) {
        return ResponseEntity.ok(notificationService.getNotificationsByStudentId(studentId));
    }

//    @PutMapping("/change-password/{adminId}")
//    public ResponseEntity<String> changePassword(@PathVariable Long adminId,
//                                                 @RequestBody ChangePasswordRequest request) {
//        try {
//            adminService.changePassword(
//                    adminId,
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
            adminService.changePasswordByEmail(
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

    @PostMapping("/students/sync-practice-statuses")
    public ResponseEntity<String> syncPracticeStatuses() {
        int updated = studentService.syncPracticeStatusesByCompanyName();
        return ResponseEntity.ok("Updated students: " + updated);
    }

    @GetMapping("/templates")
    public ResponseEntity<List<TemplateDocument>> getAllTemplates() {
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    @GetMapping("/templates/{templateId}")
    public ResponseEntity<Resource> downloadTemplate(@PathVariable Long templateId) {
        TemplateDocument templateDocument = templateService.getTemplateById(templateId);
        Resource resource = templateService.downloadTemplate(templateId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(templateDocument.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + templateDocument.getFileName() + "\"")
                .body(resource);
    }

    @PostMapping("/templates")
    public ResponseEntity<TemplateDocument> uploadTemplate(
            @RequestParam("displayName") String displayName,
            @RequestParam("category") TemplateCategory category,
            @RequestParam("file")MultipartFile file
    ) throws IOException {
        return ResponseEntity.ok(templateService.uploadTemplate(displayName, category, file));
    }

    @PutMapping("/templates/{templateId}/display-name")
    public ResponseEntity<TemplateDocument> updateTemplateDisplayName(
            @PathVariable Long templateId,
            @RequestBody UpdateTemplateDisplayNameRequest request
    ) {
        return ResponseEntity.ok(templateService.updateTemplateDisplayName(templateId, request.getDisplayName()));
    }

    @PutMapping("/templates/{templateId}/category")
    public ResponseEntity<TemplateDocument> updateTemplateCategory(
            @PathVariable Long templateId,
            @RequestBody UpdateTemplateCategoryRequest request
            ) {
        return ResponseEntity.ok(
                templateService.updateTemplateCategory(templateId, request.getCategory())
        );
    }

    @PutMapping("/templates/{templateId}/file")
    public ResponseEntity<TemplateDocument> replaceTemplateFile(
            @PathVariable Long templateId,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        return ResponseEntity.ok(templateService.replaceTemplateFile(templateId, file));
    }

    @DeleteMapping("/templates/{templateId}")
    public ResponseEntity<String> deleteTemplate(@PathVariable Long templateId) {
        templateService.deleteTemplate(templateId);
        return ResponseEntity.ok("Template deleted successfully");
    }
}
