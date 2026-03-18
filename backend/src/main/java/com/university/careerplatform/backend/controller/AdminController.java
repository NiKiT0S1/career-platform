/**
 * REST API for administrator actions:
 * student filtering, notifications, management.
 */

package com.university.careerplatform.backend.controller;

import com.university.careerplatform.backend.dto.SendNotificationByFilterRequest;
import com.university.careerplatform.backend.dto.SendNotificationRequest;
import com.university.careerplatform.backend.entity.Student;
import com.university.careerplatform.backend.service.NotificationService;
import com.university.careerplatform.backend.service.ResumeService;
import com.university.careerplatform.backend.service.StudentService;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final StudentService studentService;
    private final NotificationService notificationService;
    private final ResumeService resumeService;

    public AdminController(StudentService studentService,
                           NotificationService notificationService,
                           ResumeService resumeService) {
        this.studentService = studentService;
        this.notificationService = notificationService;
        this.resumeService = resumeService;
    }

    @GetMapping("/students")
    public ResponseEntity<Page<Student>> getStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(studentService.getStudentPage(page, size));
    }

    @GetMapping("/students/filter")
    public ResponseEntity<Page<Student>> filterStudents(
            @RequestParam(required = false) String educationalProgram,
            @RequestParam(required = false) Integer course,
            @RequestParam(required = false) String practiceStatus,
            @RequestParam(required = false) Double minGpa,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(
                studentService.filterStudents(
                        educationalProgram,
                        course,
                        practiceStatus,
                        minGpa,
                        page,
                        size
                )
        );
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
                request.getEducationalProgram(),
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
}
