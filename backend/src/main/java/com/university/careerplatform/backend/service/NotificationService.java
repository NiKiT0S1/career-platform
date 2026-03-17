/**
 * Service responsible for sending and managing notifications.
 */

package com.university.careerplatform.backend.service;

import com.university.careerplatform.backend.entity.Notification;
import com.university.careerplatform.backend.entity.Student;
import com.university.careerplatform.backend.repository.NotificationRepository;
import com.university.careerplatform.backend.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final StudentRepository studentRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               StudentRepository studentRepository) {
        this.notificationRepository = notificationRepository;
        this.studentRepository = studentRepository;
    }

    public List<Notification> getNotificationsByStudentId(Long studentId) {
        return notificationRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public List<Notification> getUnreadNotificationsByStudentId(Long studentId) {
        return notificationRepository.findByStudentIdAndIsReadFalse(studentId);
    }

    public Notification createNotification(Long studentId, String message) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Notification notification = new Notification();
        notification.setStudent(student);
        notification.setMessage(message);
        notification.setIsRead(false);

        return notificationRepository.save(notification);
    }

    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(Long studentId) {
        List<Notification> notifications = notificationRepository.findByStudentIdAndIsReadFalse(studentId);

        for (Notification notification : notifications) {
            notification.setIsRead(true);
        }

        notificationRepository.saveAll(notifications);
    }

    public void sendNotificationToMultipleStudents(List<Long> studentIds, String message) {
        for (Long studentId : studentIds) {
            createNotification(studentId, message);
        }
    }
}
