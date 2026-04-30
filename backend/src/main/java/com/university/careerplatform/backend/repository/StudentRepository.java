/**
 * Repository for student database operations.
 * Supports filtering, search and authentication queries.
 */

package com.university.careerplatform.backend.repository;

import com.university.careerplatform.backend.entity.Student;
//import com.university.careerplatform.backend.model.PracticeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

//    List<Student> findByPracticeStatus(PracticeStatus practiceStatus);

    @Query("SELECT DISTINCT s.educationalProgram FROM Student s WHERE s.educationalProgram IS NOT NULL ORDER BY s.educationalProgram")
    List<String> findDistinctEducationalProgram();

    @Query("""
       SELECT DISTINCT s.groupName
       FROM Student s
       WHERE s.groupName IS NOT NULL
       AND (:educationalProgram IS NULL OR s.educationalProgram = :educationalProgram)
       ORDER BY s.groupName
       """)
    List<String> findDistinctGroupNamesByEducationalProgram(@Param("educationalProgram") String educationalProgram);

    @Query("select distinct s.course from Student s where s.course is not null order by s.course")
    List<Integer> findAllDistinctCourses();

//    @Modifying
//    @Query("""
//        UPDATE Student s
//        SET s.practiceStatus = 'EMPLOYED'
//        WHERE s.companyName IS NOT NULL
//            AND TRIM(s.companyName) <> ''
//    """)
//    int markStudentsAsInPractice();

//    @Modifying
//    @Query("""
//        UPDATE Student s
//        SET s.practiceStatus = 'IN_PRACTICE'
//        WHERE s.companyName IS NOT NULL
//            AND TRIM(s.companyName) <> ''
//    """)
//    int markStudentsAsInPractice();

//    @Modifying
//    @Query("""
//        UPDATE Student s
//        SET s.practiceStatus = 'NOT_FOUND'
//        WHERE s.companyName IS NULL
//            OR TRIM(s.companyName) = ''
//    """)
//    int markStudentsAsNotAssigned();

//    @Modifying
//    @Query("""
//        UPDATE Student s
//        SET s.practiceStatus = 'NOT_ASSIGNED'
//        WHERE s.companyName IS NULL
//            OR TRIM(s.companyName) = ''
//    """)
//    int markStudentsAsNotAssigned();

    List<Student> findByIdIn(List<Long> ids);

    @Query("""
        SELECT DISTINCT s
        FROM Student s
        LEFT JOIN FETCH s.practice
    """)
    List<Student> findAllWithPractice();

    @Query("""
        SELECT DISTINCT s
        FROM Student s
        LEFT JOIN FETCH s.practice
        WHERE s.id IN :ids
    """)
    List<Student> findByIdInWithPractice(@Param("ids") List<Long> ids);

    @Query("""
        SELECT s.id 
        FROM Student s 
        ORDER BY s.id
""")
    List<Long> findAllStudentIds();
}
