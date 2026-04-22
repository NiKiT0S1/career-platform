/**
 * ================================
 * CompanyType Enum
 * ================================
 * Represents legal type of a company.
 *
 * Values:
 * - ZHSHS      (ЖШС)
 * - AQ         (АҚ)
 * - KB         (ҚБ)
 * - KEAK       (КЕАҚ)
 * - RMK        (РМК)
 * - ZHK        (ЖК)
 * - KK         (ҚҚ)
 * - SHZHK_RMK  (ШЖҚ РМК)
 * - ROO        (РОО)
 * - GZI        (ҒЗИ)
 * - OO         (ОО)
 * - ZTB        (ЗТБ)
 *
 * Notes:
 * - Used for company classification
 * - Filled automatically via CompanyDirectory
 * ================================
 */

package com.university.careerplatform.backend.model;

public enum CompanyType {
    ZHSHS,  // ЖШС
    AQ,  // АҚ
    KB,  // ҚБ
    KEAK,  // КЕАҚ
    RMK,  // РМК
    ZHK,  // ЖК
    KK,  // ҚҚ
    SHZHK_RMK,  // ШЖҚ РМК
    ROO,  // РОО
    GZI,  // ҒЗИ
    OO,  // ОО
    ZTB  // ЗТБ
}
