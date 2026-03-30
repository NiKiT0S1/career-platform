/**
 * Entity representing a student in the platform.
 * Contains profile data, academic information and internship status.
 */

package com.university.careerplatform.backend.entity;

import com.university.careerplatform.backend.model.PracticeStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "students")
@Getter
@Setter
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String groupName;

    @Column(nullable = false)
    private Integer course;

    @Column(name = "educational_program")
    private String educationalProgram;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    private Double gpa;

    private String companyName;

//    @Enumerated(EnumType.STRING)
    private String practiceStatus;

    @Column(nullable = false)
    private String password;

    private String resumePath;
}
