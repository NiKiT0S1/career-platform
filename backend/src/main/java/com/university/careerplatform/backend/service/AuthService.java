/**
 * Authentication service for login and JWT generation.
 * Supports both students and admins.
 */

package com.university.careerplatform.backend.service;

import com.university.careerplatform.backend.dto.AuthResponse;
import com.university.careerplatform.backend.dto.LoginRequest;
import com.university.careerplatform.backend.dto.ResetPasswordRequest;
import com.university.careerplatform.backend.dto.VerifyResetCodeRequest;
import com.university.careerplatform.backend.entity.Admin;
import com.university.careerplatform.backend.entity.PasswordResetCode;
import com.university.careerplatform.backend.entity.Student;
import com.university.careerplatform.backend.repository.AdminRepository;
import com.university.careerplatform.backend.repository.PasswordResetRepository;
import com.university.careerplatform.backend.repository.StudentRepository;
import com.university.careerplatform.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

    private final StudentRepository studentRepository;
    private final AdminRepository adminRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetRepository passwordResetRepository;
    private final EmailService emailService;

    private static final int RESET_CODE_EXPIRATION_MINUTES = 10;
    private static final int MAX_RESET_ATTEMPTS = 5;

    public AuthService(StudentRepository studentRepository,
                       AdminRepository adminRepository,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder,
                       PasswordResetRepository passwordResetRepository,
                       EmailService emailService) {
        this.studentRepository = studentRepository;
        this.adminRepository = adminRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.passwordResetRepository = passwordResetRepository;
        this.emailService = emailService;
    }

    public AuthResponse login(LoginRequest request) {
        Optional<Admin> adminOptional = adminRepository.findByEmail(request.getEmail());
        if (adminOptional.isPresent()) {
            Admin admin = adminOptional.get();

            if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
                throw new RuntimeException("Invalid password");
            }

            String token = jwtService.generateToken(admin.getEmail(), "ADMIN");
            return new AuthResponse(token, "ADMIN");
        }

        Optional<Student> studentOptional = studentRepository.findByEmail(request.getEmail());
        if (studentOptional.isPresent()) {
            Student student = studentOptional.get();

            if (!passwordEncoder.matches(request.getPassword(), student.getPassword())) {
                throw new RuntimeException("Invalid password");
            }

            String token = jwtService.generateToken(student.getEmail(), "STUDENT");
            return new AuthResponse(token, "STUDENT");
        }

        throw new RuntimeException("User not found");
    }

    @Transactional
    public void requestPasswordResetCode(String email) {
        String normalizedEmail = normalizeEmail(email);

        if (!userExists(normalizedEmail)) {
            return;
        }

        String code = generateSixDigitCode();

        PasswordResetCode resetCode = new PasswordResetCode();
        resetCode.setEmail(normalizedEmail);
        resetCode.setCodeHash(passwordEncoder.encode(code));
        resetCode.setExpiresAt(LocalDateTime.now().plusMinutes(RESET_CODE_EXPIRATION_MINUTES));
        resetCode.setUsed(false);
        resetCode.setAttempts(0);

        passwordResetRepository.save(resetCode);

        emailService.sendPasswordResetCode(normalizedEmail, code);
    }

    @Transactional
    public void verifyPasswordResetCode(VerifyResetCodeRequest request) {
        PasswordResetCode resetCode = getValidResetCode(
                normalizeEmail(request.getEmail()),
                request.getCode()
        );

        resetCode.setAttempts(resetCode.getAttempts());
        passwordResetRepository.save(resetCode);
    }

    public void resetPassword(ResetPasswordRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());

        PasswordResetCode resetCode = getValidResetCode(
                normalizeEmail(request.getEmail()),
                request.getCode()
        );

        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            throw new RuntimeException("New password cannot be empty");
        }

        if (request.getNewPassword().trim().length() < 4) {
            throw new RuntimeException("Password must contain at least 4 characters");
        }

        Optional<Admin> adminOptional = adminRepository.findByEmail(normalizedEmail);
        if (adminOptional.isPresent()) {
            Admin admin = adminOptional.get();
//            admin.setPassword(passwordEncoder.encode(request.getNewPassword()));
//            adminRepository.save(admin);
            if (passwordEncoder.matches(request.getNewPassword(), admin.getPassword())) {
                throw new RuntimeException("New password must be different from old password");
            }

            admin.setPassword(passwordEncoder.encode(request.getNewPassword().trim()));
            adminRepository.save(admin);

            resetCode.setUsed(true);
            passwordResetRepository.save(resetCode);
            return;
        }

        Optional<Student> studentOptional = studentRepository.findByEmail(normalizedEmail);
        if (studentOptional.isPresent()) {
            Student student = studentOptional.get();
//            student.setPassword(passwordEncoder.encode(request.getNewPassword()));
//            studentRepository.save(student);
            if (passwordEncoder.matches(request.getNewPassword(), student.getPassword())) {
                throw new RuntimeException("New password must be different from old password");
            }

            student.setPassword(passwordEncoder.encode(request.getNewPassword().trim()));
            studentRepository.save(student);

            resetCode.setUsed(true);
            passwordResetRepository.save(resetCode);
            return;
        }

        throw new RuntimeException("User not found");
    }

    private PasswordResetCode getValidResetCode(String email, String rawCode) {
        PasswordResetCode resetCode = passwordResetRepository
                .findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new RuntimeException("Invalid or expired code"));

        if (resetCode.isUsed()) {
            throw new RuntimeException("Invalid or expired code");
        }

        if (resetCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invalid or expired code");
        }

        if (resetCode.getAttempts() >= MAX_RESET_ATTEMPTS) {
            throw new RuntimeException("Too many attempts. Please request a new code");
        }

        if (!passwordEncoder.matches(rawCode, resetCode.getCodeHash())) {
            resetCode.setAttempts(resetCode.getAttempts() + 1);
            passwordResetRepository.save(resetCode);
            throw new RuntimeException("Invalid code");
        }

        return resetCode;
    }

    private boolean userExists(String email) {
        return adminRepository.findByEmail(email).isPresent()
                || studentRepository.findByEmail(email).isPresent();
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            throw new RuntimeException("Email is required");
        }

        return email.trim().toLowerCase();
    }

    private String generateSixDigitCode() {
        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }
}
