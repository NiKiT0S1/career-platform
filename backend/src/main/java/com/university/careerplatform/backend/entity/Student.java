/**
 * Entity representing a student in the platform.
 * Contains profile data, academic information and internship status.
 */

package com.university.careerplatform.backend.entity;

//import com.university.careerplatform.backend.model.PracticeStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Entity
//@Table(name = "students")
@Table(name = "students", indexes = {
        @Index(name = "idx_student_full_name", columnList = "fullName"),
        @Index(name = "idx_student_course", columnList = "course"),
        @Index(name = "idx_student_gpa", columnList = "gpa"),
        @Index(name = "idx_student_educational_program", columnList = "educational_program"),
})
@Getter
@Setter
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    @Pattern(
            regexp = "^[a-zA-Z0-9\\s\\-]+$",
            message = "Group name must contain only latin letters, digits, spaces and hyphens"
    )
    private String groupName;

    @Column(nullable = false)
    private Integer course;

    @Column(name = "educational_program")

    private String educationalProgram;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    private Double gpa;

//    private String companyName;  // legacy
//
//    @Enumerated(EnumType.STRING)
//    private PracticeStatus practiceStatus;  // legacy

    @OneToOne(mappedBy = "student", cascade = CascadeType.ALL)
    private StudentPractice practice;

    @Column(nullable = false)
    private String password;

    private String resumePath;
}
