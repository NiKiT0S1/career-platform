/**
 * ================================
 * CompanyDirectory Entity
 * ================================
 * Represents reference company data for admin search and autofill logic.
 *
 * Responsibilities:
 * - Stores company name
 * - Stores company legal type
 * - Stores default document type
 * - Stores source dataset / source sheet information
 *
 * Notes:
 * - Used for company autocomplete
 * - Used for autofill of companyType and documentType
 * ================================
 */

package com.university.careerplatform.backend.entity;

import com.university.careerplatform.backend.model.CompanyType;
import com.university.careerplatform.backend.model.DocumentType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "company_directory")
@Getter
@Setter
public class CompanyDirectory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String companyName;

    @Enumerated(EnumType.STRING)
    private CompanyType companyType;

    @Enumerated(EnumType.STRING)
    private DocumentType defaultDocumentType;

    private String sourceSheet;
}
