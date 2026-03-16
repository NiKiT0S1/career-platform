/**
 * Authentication service for login and JWT generation.
 * Supports both students and admins.
 */

package com.university.careerplatform.backend.service;

import com.university.careerplatform.backend.dto.AuthResponse;
import com.university.careerplatform.backend.dto.LoginRequest;
import com.university.careerplatform.backend.entity.Admin;
import com.university.careerplatform.backend.entity.Student;
import com.university.careerplatform.backend.repository.AdminRepository;
import com.university.careerplatform.backend.repository.StudentRepository;
import com.university.careerplatform.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final StudentRepository studentRepository;
    private final AdminRepository adminRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(StudentRepository studentRepository,
                       AdminRepository adminRepository,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.adminRepository = adminRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
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
}
