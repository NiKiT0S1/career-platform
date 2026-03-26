/**
 * Service layer for administrator operations.
 * Handles admin retrieval and management-related business logic.
 */

package com.university.careerplatform.backend.service;

import com.university.careerplatform.backend.entity.Admin;
import com.university.careerplatform.backend.entity.Student;
import com.university.careerplatform.backend.repository.AdminRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;


import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    public Optional<Admin> getAdminById(Long id) {
        return adminRepository.findById(id);
    }

    public Optional<Admin> getAdminByEmail(String email) {
        return adminRepository.findByEmail(email);
    }

    public Admin saveAdmin(Admin admin) {
        return adminRepository.save(admin);
    }

    public void changePassword(Long adminId, String currentPassword, String newPassword) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (!passwordEncoder.matches(currentPassword, admin.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        admin.setPassword(passwordEncoder.encode(newPassword));
        adminRepository.save(admin);
    }
}
