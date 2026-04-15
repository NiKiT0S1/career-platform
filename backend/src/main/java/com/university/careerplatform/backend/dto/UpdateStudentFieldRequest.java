/**
 * DTO for updating a single editable student field from the admin panel.
 */

package com.university.careerplatform.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateStudentFieldRequest {
    private String field;
    private String value;
}
