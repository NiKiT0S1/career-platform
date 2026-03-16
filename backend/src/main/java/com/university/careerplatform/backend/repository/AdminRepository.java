/**
 * Repository for administrator authentication and access.
 */

package com.university.careerplatform.backend.repository;

import com.university.careerplatform.backend.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {

    Optional<Admin> findByEmail(String email);
}
