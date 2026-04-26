/**
 * ================================
 * PracticeSettingsRepository
 * ================================
 * Repository for PracticeSettings entity.
 *
 * Responsibilities:
 * - Provides CRUD operations for practice settings
 *
 * Notes:
 * - Only one record is expected (id = 1)
 * ================================
 */

package com.university.careerplatform.backend.repository;

import com.university.careerplatform.backend.entity.PracticeSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PracticeSettingsRepository extends JpaRepository<PracticeSettings, Long> {
}
