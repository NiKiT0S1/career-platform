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

import com.university.careerplatform.backend.dto.BulkUpdatePracticeRequest;
import com.university.careerplatform.backend.dto.UpdatePracticeRequest;
import com.university.careerplatform.backend.entity.Student;
import com.university.careerplatform.backend.entity.StudentPractice;
import com.university.careerplatform.backend.repository.StudentPracticeRepository;
import com.university.careerplatform.backend.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class StudentPracticeService {

    private final StudentPracticeRepository studentPracticeRepository;
    private final StudentRepository studentRepository;
    private final ContractNumberService contractNumberService;

    public StudentPracticeService(StudentPracticeRepository studentPracticeRepository,
                                  StudentRepository studentRepository,
                                  ContractNumberService contractNumberService) {
        this.studentPracticeRepository = studentPracticeRepository;
        this.studentRepository = studentRepository;
        this.contractNumberService = contractNumberService;
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
//        Student student = practice.getStudent();
//
//        if (request.getCompanyName() != null) {
//            student.setCompanyName(request.getCompanyName());
//        }
//
//        if (request.getPracticeStatus() != null) {
//            student.setPracticeStatus(request.getPracticeStatus());
//        }

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

    @Transactional
    public List<StudentPractice> bulkUpdatePractice(BulkUpdatePracticeRequest request) {
        if (request.getStudentIds() == null || request.getStudentIds().isEmpty()) {
            throw new RuntimeException("Student IDs list cannot be empty");
        }

        boolean assignSequentialContractNumbers =
                Boolean.TRUE.equals(request.getAssignSequentialContractNumbers());

        List<String> generatedContractNumbers = assignSequentialContractNumbers
                ? contractNumberService.generateNextContractNumbers(request.getStudentIds().size())
                : List.of();

        List<StudentPractice> updatedPractices = new ArrayList<>();

//        for (Long studentId : request.getStudentIds()) {
//            StudentPractice practice = createIfAbsent(studentId);
//
//            applyPartialUpdate(practice, request);
//
//            updatedPractices.add(studentPracticeRepository.save(practice));
//        }

        for (int i = 0; i < request.getStudentIds().size(); i++) {
            Long studentId = request.getStudentIds().get(i);

            StudentPractice practice = createIfAbsent(studentId);

            applyPartialUpdate(practice, request);

            if (assignSequentialContractNumbers) {
                practice.setContractNumber(generatedContractNumbers.get(i));
            }

            updatedPractices.add(studentPracticeRepository.save(practice));
        }

        return updatedPractices;
    }

    private void applyPartialUpdate(StudentPractice practice, UpdatePracticeRequest request) {
        if (request.getCompanyName() != null && !request.getCompanyName().isBlank()) {
            practice.setCompanyName(request.getCompanyName());
        }

        if (request.getCompanyType() != null) {
            practice.setCompanyType(request.getCompanyType());
        }

        if (request.getPracticeStatus() != null) {
            practice.setPracticeStatus(request.getPracticeStatus());
        }

        if (request.getPracticeMode() != null) {
            practice.setPracticeMode(request.getPracticeMode());
        }

        if (request.getDocumentType() != null) {
            practice.setDocumentType(request.getDocumentType());
        }

        if (request.getLetterSent() != null) {
            practice.setLetterSent(request.getLetterSent());
        }

        if (request.getContractNumber() != null && !request.getContractNumber().isBlank()) {
            practice.setContractNumber(request.getContractNumber());
        }

        if (request.getContractDate() != null) {
            practice.setContractDate(request.getContractDate());
        }

        if (request.getPracticeStartDate() != null) {
            practice.setPracticeStartDate(request.getPracticeStartDate());
        }

        if (request.getPracticeEndDate() != null) {
            practice.setPracticeEndDate(request.getPracticeEndDate());
        }
    }
}
