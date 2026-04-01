/**
 * Enum representing student's internship (practice) status.
 *
 * EMPLOYED   - student has found an internship/company
 * NOT_FOUND  - student has not found an internship yet
 *
 * This enum is used:
 * - for filtering students in admin panel
 * - for updating status in student profile
 * - to ensure only valid values are stored in the database
 */

package com.university.careerplatform.backend.model;

public enum PracticeStatus {
    EMPLOYED,
    NOT_FOUND
}