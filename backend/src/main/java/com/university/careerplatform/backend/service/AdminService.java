/**
 * Service layer for administrator operations.
 * Handles admin retrieval and management-related business logic.
 */

package com.university.careerplatform.backend.service;

import com.university.careerplatform.backend.entity.Admin;
import com.university.careerplatform.backend.repository.AdminRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    private final AdminRepository adminRepository;

    public AdminService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
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
}
