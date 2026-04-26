/**
 * ================================
 * PracticeSettingsRequest
 * ================================
 * DTO for updating regular practice settings.
 *
 * Responsibilities:
 * - Transfers start and end dates from frontend
 *   to backend
 *
 * Notes:
 * - Used in PUT /api/admin/practice-settings
 * ================================
 */

package com.university.careerplatform.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PracticeSettingsRequest {

    private LocalDate regularPracticeStartDate;

    private LocalDate regularPracticeEndDate;
}
