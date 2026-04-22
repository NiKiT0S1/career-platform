/**
 * ================================
 * PracticeMode Enum
 * ================================
 * Represents internship mode selected by admin.
 *
 * Values:
 * - REGULAR_PRACTICE  (default practice with auto dates)
 * - EARLY_PRACTICE    (manual dates required)
 *
 * Responsibilities:
 * - Controls logic of date assignment
 * - Determines whether dates are auto-filled or manual
 *
 * Notes:
 * - Used only by admin
 * - Does not represent status, only workflow mode
 * ================================
 */

package com.university.careerplatform.backend.model;

public enum PracticeMode {
    REGULAR_PRACTICE, // ПРАКТИКА
    EARLY_PRACTICE // ДОСРОЧНАЯ ПРАКТИКА
}
