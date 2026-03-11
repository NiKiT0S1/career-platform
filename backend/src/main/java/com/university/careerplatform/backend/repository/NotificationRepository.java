package com.university.careerplatform.backend.repository;

import com.university.careerplatform.backend.entity.Notification;
import com.university.careerplatform.backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByStudent(Student student);

    List<Notification> findByStudentId(Long studentId);

    List<Notification> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<Notification> findByStudentIdAndIsReadFalse(Long studentId);
}
