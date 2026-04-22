/**
 * ================================
 * CompanyDirectoryService
 * ================================
 * Service for company directory search logic.
 *
 * Responsibilities:
 * - Searches companies by partial name
 * - Validates search input
 *
 * Notes:
 * - Returns empty list for blank query
 * ================================
 */

package com.university.careerplatform.backend.service;

import com.university.careerplatform.backend.entity.CompanyDirectory;
import com.university.careerplatform.backend.repository.CompanyDirectoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompanyDirectoryService {

    private final CompanyDirectoryRepository companyDirectoryRepository;

    public CompanyDirectoryService(CompanyDirectoryRepository companyDirectoryRepository) {
        this.companyDirectoryRepository = companyDirectoryRepository;
    }

    public List<CompanyDirectory> searchByCompanyName(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        return companyDirectoryRepository.findByCompanyNameContainingIgnoreCase(query.trim());
    }
}
