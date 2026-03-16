/**
 * DTO for updating student's company name.
 */

package com.university.careerplatform.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompanyUpdateRequest {

    private String companyName;
}
