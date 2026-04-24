/**
 * ================================
 * StudentPracticeService
 * ================================
 * Service for student practice management.
 *
 * Responsibilities:
 * - Creates StudentPractice for student if absent
 * - Updates practice-related data
 * - Retrieves student practice by student ID
 * ================================
 */

package com.university.careerplatform.backend.service;

import com.university.careerplatform.backend.dto.UpdatePracticeRequest;
import com.university.careerplatform.backend.entity.Student;
import com.university.careerplatform.backend.entity.StudentPractice;
import com.university.careerplatform.backend.repository.StudentPracticeRepository;
import com.university.careerplatform.backend.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentPracticeService {

    private final StudentPracticeRepository studentPracticeRepository;
    private final StudentRepository studentRepository;

    public StudentPracticeService(StudentPracticeRepository studentPracticeRepository,
                                  StudentRepository studentRepository) {
        this.studentPracticeRepository = studentPracticeRepository;
        this.studentRepository = studentRepository;
    }

    public StudentPractice getByStudentId(Long studentId) {
        return studentPracticeRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Student practice not found"));
    }

    @Transactional
    public StudentPractice createIfAbsent(Long studentId) {
        return studentPracticeRepository.findByStudentId(studentId)
                .orElseGet(() -> {
                    Student student = studentRepository.findById(studentId)
                            .orElseThrow(() -> new RuntimeException("Student not found"));

                    StudentPractice practice = new StudentPractice();
                    practice.setStudent(student);

                    return studentPracticeRepository.save(practice);
                });
    }

    @Transactional
    public StudentPractice updatePractice(Long studentId, UpdatePracticeRequest request) {
        StudentPractice practice = createIfAbsent(studentId);

        practice.setCompanyName(request.getCompanyName());
        practice.setCompanyType(request.getCompanyType());
        practice.setPracticeStatus(request.getPracticeStatus());
        practice.setPracticeMode(request.getPracticeMode());
        practice.setDocumentType(request.getDocumentType());
        practice.setLetterSent(request.getLetterSent());
        practice.setContractNumber(request.getContractNumber());
        practice.setContractDate(request.getContractDate());
        practice.setPracticeStartDate(request.getPracticeStartDate());
        practice.setPracticeEndDate(request.getPracticeEndDate());

        // SYNC WITH LEGACY FIELD
        Student student = practice.getStudent();

        if (request.getCompanyName() != null) {
            student.setCompanyName(request.getCompanyName());
        }

        if (request.getPracticeStatus() != null) {
            student.setPracticeStatus(request.getPracticeStatus());
        }

        return  studentPracticeRepository.save(practice);
    }

//    @Transactional
//    public StudentPractice getOrCreateByStudentId(Long studentId) {
//        return studentPracticeRepository.findByStudentId(studentId)
//                .orElseGet(() -> {
//                    Student student = studentRepository.findById(studentId)
//                            .orElseThrow(() -> new RuntimeException("Student not found"));
//
//                    StudentPractice practice = new StudentPractice();
//                    practice.setStudent(student);
//
//                    return studentPracticeRepository.save(practice);
//                });
//    }

    @Transactional
    public StudentPractice getByStudentIdOrEmpty(Long studentId) {
        return studentPracticeRepository.findByStudentId(studentId)
                .orElseGet(() -> {
                    Student student = studentRepository.findById(studentId)
                            .orElseThrow(() -> new RuntimeException("Student not found"));

                    StudentPractice practice = new StudentPractice();
                    practice.setStudent(student);

                    return practice;
                });
    }
}
