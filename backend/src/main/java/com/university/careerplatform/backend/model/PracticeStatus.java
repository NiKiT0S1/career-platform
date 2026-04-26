/**
 * ================================
 * PracticeStatus Enum
 * ================================
 * Represents current internship state of a student.
 *
 * Values:
 * - EMPLOYED          (legacy)
 * - NOT_FOUND         (legacy)
 * - IN_PRACTICE       (active internship)
 * - NOT_ASSIGNED      (Not assigned)
 * - EARLY_COMPLETION  (early completion)
 * - MOBILITY          (academic mobility)
 *
 * Notes:
 * - Legacy values are kept for backward compatibility
 * - Will be fully refactored in later stages
 * ================================
 */

package com.university.careerplatform.backend.model;

public enum PracticeStatus {
//    EMPLOYED, // legacy
//    NOT_FOUND, // legacy

    IN_PRACTICE, // НА ПРАКТИКЕ
    NOT_ASSIGNED, // НЕ НАЗНАЧЕНО
    EARLY_COMPLETION, // ДОСРОЧНО ЗАКРЫЛ
    MOBILITY // МОБИЛЬНОСТЬ
}