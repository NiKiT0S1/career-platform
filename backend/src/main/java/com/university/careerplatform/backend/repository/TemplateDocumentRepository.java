/**
 * Repository for accessing template documents from the database.
 */

package com.university.careerplatform.backend.repository;

import com.university.careerplatform.backend.entity.TemplateDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface TemplateDocumentRepository extends JpaRepository<TemplateDocument, Long> {

    Optional<TemplateDocument> findByStorageKey(String storageKey);

    List<TemplateDocument> findAllByOrderByCategoryAscDisplayNameAsc();
}
