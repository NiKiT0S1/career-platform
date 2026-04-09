/**
 * Service responsible for managing template documents.
 * Handles upload, download, update, and deletion of templates in Cloudflare R2 and database.
 */

package com.university.careerplatform.backend.service;

import com.university.careerplatform.backend.entity.TemplateDocument;
import com.university.careerplatform.backend.model.TemplateCategory;
import com.university.careerplatform.backend.repository.TemplateDocumentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class TemplateService {

    private final TemplateDocumentRepository templateDocumentRepository;
    private final S3Client s3Client;

    @Value("${r2.bucket-name}")
    private String bucketName;

    public TemplateService(TemplateDocumentRepository templateDocumentRepository, S3Client s3Client) {
        this.templateDocumentRepository = templateDocumentRepository;
        this.s3Client = s3Client;
    }

    public TemplateDocument uploadTemplate(String displayName,
                                           TemplateCategory category,
                                           MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("Template file is empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new RuntimeException("Template file name is invalid");
        }

        String storageKey = "templates/" + UUID.randomUUID() + "_" + originalFilename;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(storageKey)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(
                putObjectRequest,
                RequestBody.fromBytes(file.getBytes())
        );

        LocalDateTime now = LocalDateTime.now();

        TemplateDocument templateDocument = new TemplateDocument();
        templateDocument.setDisplayName(displayName);
        templateDocument.setFileName(originalFilename);
        templateDocument.setStorageKey(storageKey);
        templateDocument.setContentType(file.getContentType() != null
                ? file.getContentType()
                : "application/octet-stream");
        templateDocument.setCategory(category);
        templateDocument.setUploadedAt(now);
        templateDocument.setUpdatedAt(now);

        return templateDocumentRepository.save(templateDocument);
    }

    public List<TemplateDocument> getAllTemplates() {
        return templateDocumentRepository.findAllByOrderByUpdatedAtDesc();
    }

    public TemplateDocument getTemplateById(Long templateId) {
        return templateDocumentRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));
    }

    public Resource downloadTemplate(Long templateId) {
        TemplateDocument templateDocument = templateDocumentRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(
                GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(templateDocument.getStorageKey())
                        .build()
        );

        return new ByteArrayResource(objectBytes.asByteArray());
    }

    public TemplateDocument updateTemplateDisplayName(Long templateId, String newDisplayName) {
        TemplateDocument templateDocument = templateDocumentRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        templateDocument.setDisplayName(newDisplayName);
        templateDocument.setUpdatedAt(LocalDateTime.now());

        return templateDocumentRepository.save(templateDocument);
    }

    public TemplateDocument updateTemplateCategory(Long templateId, TemplateCategory newCategory) {
        TemplateDocument templateDocument = templateDocumentRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        templateDocument.setCategory(newCategory);
        templateDocument.setUpdatedAt(LocalDateTime.now());

        return templateDocumentRepository.save(templateDocument);
    }

    public TemplateDocument replaceTemplateFile(Long templateId, MultipartFile newFile) throws IOException {
        TemplateDocument templateDocument = templateDocumentRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        if (newFile.isEmpty()) {
            throw new RuntimeException("New template file is empty");
        }

        String oldStorageKey = templateDocument.getStorageKey();

        String originalFilename = newFile.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new RuntimeException("New template file name is invalid");
        }

        String newStorageKey = "templates/" + UUID.randomUUID() + "_" + originalFilename;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(newStorageKey)
                .contentType(newFile.getContentType())
                .build();

        s3Client.putObject(
                putObjectRequest,
                RequestBody.fromBytes(newFile.getBytes())
        );

        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(oldStorageKey)
                .build());

        templateDocument.setFileName(originalFilename);
        templateDocument.setStorageKey(newStorageKey);
        templateDocument.setContentType(newFile.getContentType() != null
                ? newFile.getContentType()
                : "application/octet-stream");
        templateDocument.setUpdatedAt(LocalDateTime.now());

        return templateDocumentRepository.save(templateDocument);
    }

    public void deleteTemplate(Long templateId) {
        TemplateDocument templateDocument = templateDocumentRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(templateDocument.getStorageKey())
                .build());

        templateDocumentRepository.delete(templateDocument);
    }
}
