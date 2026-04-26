/**
 * ================================
 * CompanyType Enum
 * ================================
 * Represents legal type of a company.
 *
 * Values:
 * - ZHSHS      (ЖШС)
 * - AK         (АҚ)
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
    AK,  // АҚ
    KB,  // ҚБ
    KEAK,  // КЕАҚ
    RMK,  // РМК
    ZHK,  // ЖК
    KK,  // ҚҚ
    SHZHK_RMK,  // ШЖҚ РМК
    ROO,  // РОО
    GZI,  // ҒЗИ
    OO,  // ОО
    ZTB,  // ЗТБ

    MEKEME,  // Мекеме
    EB_AK,  // ЕБ АҚ
    RMKK_PGO, // РМҚК РҒО
    RMKK,  // РМҚК
    OOO,  // OOO
    SHZHK_MKK, // ШЖҚ МКК
    KMM,  // КММ
    MM,  // ММ
    RKB, // РҚБ
    RMM  // РММ
}
