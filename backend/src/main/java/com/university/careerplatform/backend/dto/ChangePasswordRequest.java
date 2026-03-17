/**
 * DTO for changing student's profile password.
 */

package com.university.careerplatform.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordRequest {

    private String currentPassword;
    private String newPassword;
}
