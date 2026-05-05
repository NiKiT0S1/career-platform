/**
 * ================================
 * PracticeSettingsService
 * ================================
 * Service layer for managing practice settings.
 *
 * Responsibilities:
 * - Retrieves current settings (creates if not exists)
 * - Updates regular practice start/end dates
 *
 * Notes:
 * - Ensures singleton behavior (id = 1)
 * - Acts as central point for business logic
 * ================================
 */

package com.university.careerplatform.backend.service;

import com.university.careerplatform.backend.dto.PracticeSettingsRequest;
import com.university.careerplatform.backend.entity.PracticeSettings;
import com.university.careerplatform.backend.repository.PracticeSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PracticeSettingsService {

    private final PracticeSettingsRepository practiceSettingsRepository;

    public PracticeSettingsService(PracticeSettingsRepository practiceSettingsRepository) {
        this.practiceSettingsRepository = practiceSettingsRepository;
    }

    public PracticeSettings getSettings() {
        return practiceSettingsRepository.findById(1L)
                .orElseGet(() -> {
                    PracticeSettings settings = new PracticeSettings();
                    settings.setId(1L);
                    settings.setAcademicYearStart(2026);
                    return practiceSettingsRepository.save(settings);
                });
    }

    @Transactional
    public PracticeSettings updateSettings(PracticeSettingsRequest request) {
        PracticeSettings settings = getSettings();

        settings.setRegularPracticeStartDate(request.getRegularPracticeStartDate());
        settings.setRegularPracticeEndDate(request.getRegularPracticeEndDate());

        settings.setAcademicYearStart(request.getAcademicYearStart());

        return  practiceSettingsRepository.save(settings);
    }
}
