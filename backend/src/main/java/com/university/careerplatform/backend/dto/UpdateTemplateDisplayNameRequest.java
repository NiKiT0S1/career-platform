/**
 * DTO for update display name of template.
 */

package com.university.careerplatform.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateTemplateDisplayNameRequest {
    private String displayName;
}
