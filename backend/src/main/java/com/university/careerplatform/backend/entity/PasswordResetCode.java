/**
 * ================================
 * PasswordResetCode
 * ================================
 * Entity for storing temporary password reset codes.
 *
 * Responsibilities:
 * - Stores hashed reset code
 * - Tracks expiration time
 * - Tracks usage state and failed attempts
 *
 * Notes:
 * - Code itself is not stored in plain text
 * - Used by Forgot Password flow
 * ================================
 */

package com.university.careerplatform.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_codes")
@Getter
@Setter
public class PasswordResetCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String codeHash;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean used = false;

    @Column(nullable = false)
    private int attempts = 0;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
