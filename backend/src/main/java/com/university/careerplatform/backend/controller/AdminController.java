package com.university.careerplatform.backend.controller;

import com.university.careerplatform.backend.dto.SendNotificationRequest;
import com.university.careerplatform.backend.entity.Student;
import com.university.careerplatform.backend.service.NotificationService;
import com.university.careerplatform.backend.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final StudentService studentService;
    private final NotificationService notificationService;

    public AdminController(StudentService studentService,
                           NotificationService notificationService) {
        this.studentService = studentService;
        this.notificationService = notificationService;
    }

    @GetMapping("/students")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/students/filter")
    public ResponseEntity<List<Student>> filterStudents(@RequestParam(required = false) String educationalProgram,
                                                        @RequestParam(required = false) Integer course,
                                                        @RequestParam(required = false) String practiceStatus,
                                                        @RequestParam(required = false) Double minGpa) {
        if (educationalProgram != null) {
            return ResponseEntity.ok(studentService.getStudentsByEducationalProgram(educationalProgram));
        }
        if (course != null) {
            return ResponseEntity.ok(studentService.getStudentsByCourse(course));
        }
        if (practiceStatus != null) {
            return ResponseEntity.ok(studentService.getStudentsByPracticeStatus(practiceStatus));
        }
        if (minGpa != null) {
            return ResponseEntity.ok(studentService.getStudentsByMinGpa(minGpa));
        }

        return ResponseEntity.ok(studentService.getAllStudents());
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
}
