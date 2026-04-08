/**
 * Entity representing a template document stored in Cloudflare R2.
 * Contains metadata such as display name, file name, storage key, and category.
 */

package com.university.careerplatform.backend.entity;

import com.university.careerplatform.backend.model.TemplateCategory;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "template_documents")
@NoArgsConstructor
public class TemplateDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String displayName;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false, unique = true)
    private String storageKey;

    @Column(nullable = false)
    private String contentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TemplateCategory category;

    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
