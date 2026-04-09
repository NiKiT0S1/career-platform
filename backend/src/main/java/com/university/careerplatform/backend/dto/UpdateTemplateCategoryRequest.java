/**
 * DTO for update category of template.
 */

package com.university.careerplatform.backend.dto;

import com.university.careerplatform.backend.model.TemplateCategory;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateTemplateCategoryRequest {
    private TemplateCategory category;
}
