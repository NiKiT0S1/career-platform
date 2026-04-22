/**
 * ================================
 * UpdatePracticeRequest DTO
 * ================================
 * Request payload for updating student practice data.
 *
 * Responsibilities:
 * - Transfers admin-updated practice fields
 * - Used by admin practice update endpoint
 * ================================
 */

package com.university.careerplatform.backend.dto;

import com.university.careerplatform.backend.model.CompanyType;
import com.university.careerplatform.backend.model.DocumentType;
import com.university.careerplatform.backend.model.PracticeMode;
import com.university.careerplatform.backend.model.PracticeStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UpdatePracticeRequest {

    private String companyName;

    private CompanyType companyType;

    private PracticeStatus practiceStatus;

    private PracticeMode practiceMode;

    private DocumentType documentType;

    private Boolean letterSent;

    private String contractNumber;

    private LocalDate contractDate;

    private LocalDate practiceStartDate;

    private LocalDate practiceEndDate;
}
