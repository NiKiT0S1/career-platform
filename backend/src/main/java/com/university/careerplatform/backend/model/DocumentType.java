/**
 * ================================
 * DocumentType Enum
 * ================================
 * Represents type of supporting document.
 *
 * Values:
 * - BILATERAL_CONTRACT
 * - MEMORANDUM
 * - TRILATERAL_CONTRACT
 * - OFFICIAL_MEMO
 * - DUAL_EDUCATION
 * - EMPLOYMENT_CERTIFICATE
 *
 * Notes:
 * - Used for internship validation workflow
 * - May be auto-filled from CompanyDirectory
 * ================================
 */

package com.university.careerplatform.backend.model;

public enum DocumentType {
    BILATERAL_CONTRACT,  // 2-Х СТОРОННИЙ ДОГОВОР
    MEMORANDUM,  // МЕМОРАНДУМ
    TRILATERAL_CONTRACT,  // 3-Х СТОРОННИЙ ДОГОВОР
    OFFICIAL_MEMO,  // СЛУЖЕБНАЯ ЗАПИСКА
    DUAL_EDUCATION,  // ДУАЛЬНОЕ ОБУЧЕНИЕ
    EMPLOYMENT_CERTIFICATE,  // СПРАВКА С МЕСТА РАБОТЫ
}
