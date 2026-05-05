/**
 * ================================
 * StudentPracticeRepository
 * ================================
 * Repository for StudentPractice entity.
 *
 * Responsibilities:
 * - CRUD operations for student practice data
 * - Find practice by student ID
 *
 * Notes:
 * - Used in admin practice management logic
 * ================================
 */

package com.university.careerplatform.backend.repository;

import com.university.careerplatform.backend.entity.StudentPractice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentPracticeRepository extends JpaRepository<StudentPractice, Long> {
    Optional<StudentPractice> findByStudentId(Long studentId);

    @Query("""
            SELECT sp.contractNumber
            FROM StudentPractice sp
            WHERE sp.contractNumber LIKE %:yearCode
    """)
    List<String> findContractNumbersByYearCode(@Param("yearCode") String yearCode);
}
