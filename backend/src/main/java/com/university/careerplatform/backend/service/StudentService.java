/**
 * Service layer for student profile operations.
 * Handles profile updates, filtering, changing password and business logic.
 */

package com.university.careerplatform.backend.service;

import com.university.careerplatform.backend.entity.Student;
import com.university.careerplatform.backend.model.PracticeStatus;
import com.university.careerplatform.backend.repository.StudentRepository;
import com.university.careerplatform.backend.specification.StudentSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.Optional;

@Validated
@Service
public class StudentService {

    private final StudentRepository studentRepository;

    private final PasswordEncoder passwordEncoder;

    public StudentService(StudentRepository studentRepository,  PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public List<Student> getAllFilteredStudents(String fullName,
                                                String educationalProgram,
                                                String groupName,
                                                Integer course,
                                                String practiceStatus,
                                                Double minGpa) {
        return studentRepository.findAll(
                StudentSpecification.filterStudents(
                        fullName,
                        educationalProgram,
                        groupName,
                        course,
                        practiceStatus,
                        minGpa
                )
        );
    }

    public Optional<Student> getStudentById(Long id) {
        return studentRepository.findById(id);
    }

    public Student getCurrentStudent(String email) {
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public Optional<Student> getStudentByEmail(String email) {
        return studentRepository.findByEmail(email);
    }

    public List<Student> getStudentsByEducationalProgram(String educationalProgram) {
        return studentRepository.findByEducationalProgram(educationalProgram);
    }

    public List<String> getAllEducationalPrograms() {
        return studentRepository.findDistinctEducationalProgram();
    }

    public List<String> getGroupNamesByEducationalProgram(String educationalProgram) {
        return studentRepository.findDistinctGroupNamesByEducationalProgram(educationalProgram);
    }

    public List<Student> getStudentsByCourse(Integer course) {
        return studentRepository.findByCourse(course);
    }

    public List<Student> getStudentsByExactGpa(Double gpa) {
        return studentRepository.findByGpa(gpa);
    }

    public List<Student> getStudentsByMinGpa(Double gpa) {
        return studentRepository.findByGpaGreaterThanEqual(gpa);
    }

    public List<Student> getStudentsByPracticeStatus(PracticeStatus practiceStatus) {
        return studentRepository.findByPracticeStatus(practiceStatus);
    }

    public Student saveStudent(Student student) {
        return studentRepository.save(student);
    }

//    ## OLD METHOD ##
//    public Student updateCompanyName(Long studentId, String companyName) {
//        Student student = studentRepository.findById(studentId)
//                .orElseThrow(() -> new RuntimeException("Student not found"));
//
//        student.setCompanyName(companyName);
//        return studentRepository.save(student);
//    }

    public Student updateCompanyByEmail(String email, String companyName) {
        Student student = getCurrentStudent(email);
        student.setCompanyName(companyName);
        return studentRepository.save(student);
    }

//    ## OLD METHOD ##
//    public Student updatePracticeStatus(Long studentId, String practiceStatus) {
//        Student student = studentRepository.findById(studentId)
//                .orElseThrow(() -> new RuntimeException("Student not found"));
//
//        student.setPracticeStatus(practiceStatus);
//        return studentRepository.save(student);
//    }

    public Student updatePracticeStatusByEmail(String email, String practiceStatus) {
        Student student = getCurrentStudent(email);

        try {
            PracticeStatus status = PracticeStatus.valueOf(practiceStatus);
            student.setPracticeStatus(status);
            return studentRepository.save(student);
        }
        catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid practice status");
        }
    }

    public Page<Student> filterStudents(String fullName,
                                        String educationalProgram,
                                        String groupName,
                                        Integer course,
                                        String practiceStatus,
                                        Double minGpa,
                                        String sortBy,
                                        String sortDir,
                                        int page,
                                        int size) {
        Sort sort = Sort.unsorted();

        if (sortBy != null && !sortBy.isBlank()) {
            sort = "desc".equalsIgnoreCase(sortDir)
                    ? Sort.by(sortBy).descending()
                    : Sort.by(sortBy).ascending();
        }

        Pageable pageable = PageRequest.of(page, size, sort);
        return studentRepository.findAll(
                StudentSpecification.filterStudents(
                        fullName,
                        educationalProgram,
                        groupName,
                        course,
                        practiceStatus,
                        minGpa
                ),
                pageable
        );
    }

    public Page<Student> getStudentPage(int page, int size, String sortBy, String sortDir) {
//        Pageable pageable = PageRequest.of(page, size);

        Pageable pageable;

        if (sortBy != null && !sortBy.isBlank()) {
            Sort sort = "desc".equalsIgnoreCase(sortDir)
                    ? Sort.by(sortBy).descending()
                    : Sort.by(sortBy).ascending();

            pageable = PageRequest.of(page, size, sort);
        }
        else {
            pageable = PageRequest.of(page, size);
        }

        return studentRepository.findAll(pageable);
    }

//    ## OLD METHOD ##
//    public void changePassword(Long studentId, String currentPassword, String newPassword) {
//        Student student = studentRepository.findById(studentId)
//                .orElseThrow(() -> new RuntimeException("Student not found"));
//
//        if (!passwordEncoder.matches(currentPassword, student.getPassword())) {
//            throw new RuntimeException("Current password is incorrect");
//        }
//
//        student.setPassword(passwordEncoder.encode(newPassword));
//        studentRepository.save(student);
//    }

    public void changePasswordByEmail(String email, String currentPassword, String newPassword) {
        Student student = getCurrentStudent(email);

        if (!passwordEncoder.matches(currentPassword, student.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        student.setPassword(passwordEncoder.encode(newPassword));
        studentRepository.save(student);
    }
}
