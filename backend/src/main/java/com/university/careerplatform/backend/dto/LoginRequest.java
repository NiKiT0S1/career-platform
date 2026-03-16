/**
 * DTO for login request payload.
 */

package com.university.careerplatform.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    private String email;
    private String password;
}
