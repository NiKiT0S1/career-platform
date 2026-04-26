/**
 * ================================
 * PracticeSettings
 * ================================
 * Entity representing global settings
 * for regular practice dates.
 *
 * Responsibilities:
 * - Stores default start and end dates
 *   for REGULAR_PRACTICE mode
 * - Acts as a singleton configuration record
 *
 * Notes:
 * - Uses fixed id = 1 (single row in table)
 * - Can be extended with additional settings in future
 * ================================
 */

package com.university.careerplatform.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "practice_settings")
@Getter
@Setter
public class PracticeSettings {
    @Id
    private Long id = 1L;

    private LocalDate regularPracticeStartDate;

    private LocalDate regularPracticeEndDate;
}
