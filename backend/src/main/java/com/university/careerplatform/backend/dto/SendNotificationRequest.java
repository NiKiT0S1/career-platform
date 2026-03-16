/**
 * DTO for sending notifications to one or multiple students.
 * Contains target student IDs and message text.
 */

package com.university.careerplatform.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SendNotificationRequest {

    private List<Long> studentIds;
    private String message;
}
