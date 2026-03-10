package com.university.careerplatform.backend.entity;

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

    private String fullName;

    private String groupName;

    @Column(name = "educational_program")
    private String educationalProgram;

    private String email;

    private String phone;

    private Double gpa;

    private String companyName;

    private String practiceStatus;

    private String password;

    private String resumePath;
}
