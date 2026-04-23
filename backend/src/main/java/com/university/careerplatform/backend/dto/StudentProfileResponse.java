package com.university.careerplatform.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentProfileResponse {

    private Long id;
    private String fullName;
    private String groupName;
    private Integer course;
    private String educationalProgram;
    private String email;

    // ONLY SHOW
    private String companyName;
    private String practiceStatus;

    private String resumePath;
}
