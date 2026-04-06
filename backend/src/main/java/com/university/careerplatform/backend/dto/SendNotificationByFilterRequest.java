package com.university.careerplatform.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SendNotificationByFilterRequest {
    private String educationalProgram;
    private String groupName;
    private Integer course;
    private String practiceStatus;
    private Double minGpa;
    private String message;
}
