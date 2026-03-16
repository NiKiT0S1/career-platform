/**
 * Service layer for student profile operations.
 * Handles profile updates, filtering and business logic.
 */

package com.university.careerplatform.backend.service;

import com.university.careerplatform.backend.entity.Student;
import com.university.careerplatform.backend.repository.StudentRepository;
import com.university.careerplatform.backend.specification.StudentSpecification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Optional<Student> getStudentById(Long id) {
        return studentRepository.findById(id);
    }

    public Optional<Student> getStudentByEmail(String email) {
        return studentRepository.findByEmail(email);
    }

    public List<Student> getStudentsByEducationalProgram(String educationalProgram) {
        return studentRepository.findByEducationalProgram(educationalProgram);
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

    public List<Student> getStudentsByPracticeStatus(String practiceStatus) {
        return studentRepository.findByPracticeStatus(practiceStatus);
    }

    public Student saveStudent(Student student) {
        return studentRepository.save(student);
    }

    public Student updateCompanyName(Long studentId, String companyName) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        student.setCompanyName(companyName);
        return studentRepository.save(student);
    }

    public Student updatePracticeStatus(Long studentId, String practiceStatus) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        student.setPracticeStatus(practiceStatus);
        return studentRepository.save(student);
    }

    public List<Student> filterStudents(String educationalProgram,
                                        Integer course,
                                        String practiceStatus,
                                        Double minGpa) {
        return studentRepository.findAll(
                StudentSpecification.filterStudents(
                        educationalProgram,
                        course,
                        practiceStatus,
                        minGpa
                )
        );
    }
}
