/**
 * ================================
 * PasswordResetCodeRepository
 * ================================
 * Repository for password reset code operations.
 *
 * Responsibilities:
 * - Finds latest reset code by email
 * - Stores temporary reset code records
 *
 * Notes:
 * - Used by Forgot Password flow
 * ================================
 */

package com.university.careerplatform.backend.repository;

import com.university.careerplatform.backend.entity.PasswordResetCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PasswordResetRepository extends JpaRepository<PasswordResetCode, Long> {

    Optional<PasswordResetCode> findTopByEmailOrderByCreatedAtDesc(String email);

    List<PasswordResetCode> findByEmailAndUsedFalse(String email);
}
