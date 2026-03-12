package com.university.careerplatform.backend.repository;

import com.university.careerplatform.backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long>, JpaSpecificationExecutor<Student> {

    Optional<Student> findByEmail(String email);

    List<Student> findByCourse(Integer course);

    List<Student> findByEducationalProgram(String educationalProgram);

    List<Student> findByGpa(Double gpa);

    List<Student> findByGpaGreaterThanEqual(Double gpa);

    List<Student> findByPracticeStatus(String practiceStatus);
}
