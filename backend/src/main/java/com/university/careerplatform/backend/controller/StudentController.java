package com.university.careerplatform.backend.controller;

import com.university.careerplatform.backend.dto.CompanyUpdateRequest;
import com.university.careerplatform.backend.entity.Notification;
import com.university.careerplatform.backend.entity.Student;
import com.university.careerplatform.backend.service.NotificationService;
import com.university.careerplatform.backend.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    private final StudentService studentService;
    private final NotificationService notificationService;

    public StudentController(StudentService studentService, NotificationService notificationService) {
        this.studentService = studentService;
        this.notificationService = notificationService;
    }

    @GetMapping("/profile/{studentId}")
    public ResponseEntity<Student> getStudentProfile(@PathVariable Long studentId) {
        Optional<Student> student = studentService.getStudentById(studentId);

        return student.map(ResponseEntity::ok).
                orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/company/{studentId}")
    public ResponseEntity<Student> updateCompanyName(@PathVariable Long studentId,
                                                     @RequestBody CompanyUpdateRequest request) {
        try {
            Student updatedStudent = studentService.updateCompanyName(studentId, request.getCompanyName());
            return ResponseEntity.ok(updatedStudent);
        }
        catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/notifications/{studentId}")
    public ResponseEntity<List<Notification>> getStudentNotifications(@PathVariable Long studentId) {
        List<Notification> notifications = notificationService.getNotificationsByStudentId(studentId);
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



}
