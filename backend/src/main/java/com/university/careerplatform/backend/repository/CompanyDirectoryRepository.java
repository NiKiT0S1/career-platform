/**
 * ================================
 * CompanyDirectoryRepository
 * ================================
 * Repository for CompanyDirectory entity.
 *
 * Responsibilities:
 * - Basic CRUD operations
 * - Search companies by partial name
 * ================================
 */

package com.university.careerplatform.backend.repository;

import com.university.careerplatform.backend.entity.CompanyDirectory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompanyDirectoryRepository extends JpaRepository<CompanyDirectory, Long> {

    List<CompanyDirectory> findByCompanyNameContainingIgnoreCase(String query);
}
