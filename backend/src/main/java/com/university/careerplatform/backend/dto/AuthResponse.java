/**
 * DTO containing JWT token and user role after successful login.
 */

package com.university.careerplatform.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String role;
}
