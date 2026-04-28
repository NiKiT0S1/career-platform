/**
 * REST API for login and JWT authentication.
 */

package com.university.careerplatform.backend.controller;

import com.university.careerplatform.backend.dto.*;
import com.university.careerplatform.backend.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || authentication.getAuthorities() == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String role = authentication.getAuthorities().stream()
                .findFirst()
                .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                .orElse(null);

        if (role == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        return ResponseEntity.ok(Map.of("role", role));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request,
                                    HttpServletResponse response) {
        try {
            AuthResponse authResponse = authService.login(request);

            ResponseCookie cookie = ResponseCookie.from("token", authResponse.getToken())
                    .httpOnly(true)
//                    .secure(false) // FOR LOCAL
//                    .sameSite("Lax") // FOR LOCAL
                    .secure(true) // FOR PROD
                    .sameSite("None") // FOR PROD
                    .path("/")
                    .maxAge(Duration.ofDays(1))
                    .build();

            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            return ResponseEntity.ok(Map.of("role", authResponse.getRole()));
        }
        catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("token", "")
                .httpOnly(true)
//                .secure(false) // FOR LOCAL
//                .sameSite("Lax") // FOR LOCAL
                .secure(true) // FOR PROD
                .sameSite("None") // FOR PROD
                .path("/")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok("Logged out successfully");
    }

    @PostMapping("/forgot-password/request-code")
    public ResponseEntity<?> requestPasswordResetCode(
            @RequestBody ForgotPasswordRequest request
    ) {
        try {
            authService.requestPasswordResetCode(request.getEmail());

            return ResponseEntity.ok("If this email exists, password reset code has been sent");
        }
        catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/forgot-password/verify-code")
    public ResponseEntity<?> verifyPasswordResetCode(
            @RequestBody VerifyResetCodeRequest request
    ) {
        try {
            authService.verifyPasswordResetCode(request);
            return ResponseEntity.ok("Code verified successfully");
        }
        catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPassword(
            @RequestBody ResetPasswordRequest request
    ) {
        try {
            authService.resetPassword(request);
            return ResponseEntity.ok("Password reset successfully");
        }
        catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
