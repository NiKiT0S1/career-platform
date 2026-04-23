/**
 * ================================
 * StudentPractice Entity
 * ================================
 * Represents internship-related data for a student.
 *
 * Responsibilities:
 * - Stores company information
 * - Stores internship dates
 * - Stores practice mode and status
 * - Stores document-related data
 *
 * Fields:
 * - companyName
 * - companyType
 * - practiceStartDate / practiceEndDate
 * - practiceMode
 * - documentType
 * - letterSent
 * - contractNumber
 * - contractDate
 * - practiceStatus
 *
 * Notes:
 * - Replaces legacy fields from Student
 * - Linked via OneToOne relationship
 * - Used only by admin logic at this stage
 * ================================
 */

package com.university.careerplatform.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.university.careerplatform.backend.model.CompanyType;
import com.university.careerplatform.backend.model.DocumentType;
import com.university.careerplatform.backend.model.PracticeMode;
import com.university.careerplatform.backend.model.PracticeStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "student_practice")
@Getter
@Setter
public class StudentPractice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private Student student;

    private String companyName;

    @Enumerated(EnumType.STRING)
    private CompanyType companyType;

    private LocalDate practiceStartDate;

    private LocalDate practiceEndDate;

    @Enumerated(EnumType.STRING)
    private PracticeMode practiceMode;

    @Enumerated(EnumType.STRING)
    private DocumentType documentType;

    private Boolean letterSent;

    private String contractNumber;

    private LocalDate contractDate;

    @Enumerated(EnumType.STRING)
    private PracticeStatus practiceStatus;
}
