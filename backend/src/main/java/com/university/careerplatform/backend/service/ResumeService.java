/**
 * Service for storing uploaded resumes and contract templates.
 */

package com.university.careerplatform.backend.service;

import com.university.careerplatform.backend.entity.Student;
import com.university.careerplatform.backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
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
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
public class ResumeService {

    private final StudentRepository studentRepository;
    private final S3Client s3Client;
    private final Path contractsPath;

    @Value("${r2.bucket-name}")
    private String bucketName;

    public ResumeService(StudentRepository studentRepository,
                         @Value("${file.contracts-dir}") String contractsDir,
                         S3Client s3Client) throws IOException {
        this.studentRepository = studentRepository;
        this.contractsPath = Paths.get(contractsDir).toAbsolutePath().normalize();
        this.s3Client = s3Client;

        Files.createDirectories(this.contractsPath);
    }

    public Student uploadResumeByEmail(String email, MultipartFile file) throws IOException {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        validatePdf(file);

        if (student.getResumePath() != null && !student.getResumePath().isBlank()) {
            s3Client.deleteObject(
                    DeleteObjectRequest.builder()
                            .bucket(bucketName)
                            .key(student.getResumePath())
                            .build()
            );
        }

        String originalFilename = Objects.requireNonNull(file.getOriginalFilename());
        String fileExtension = getFileExtension(originalFilename);

        String generatedFilename = "resumes/" + generateResumeFilename(student, fileExtension);

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(generatedFilename)
                .contentType("application/pdf")
                .build();

        s3Client.putObject(
                putObjectRequest,
                RequestBody.fromBytes(file.getBytes())
        );

        student.setResumePath(generatedFilename);
        return studentRepository.save(student);
    }

    public Resource downloadResume(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getResumePath() == null || student.getResumePath().isBlank()) {
            throw new RuntimeException("Resume not found");
        }

        ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(
                GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(student.getResumePath())
                        .build()
        );

        return new ByteArrayResource(objectBytes.asByteArray());
    }

    public Resource downloadResumeByEmail(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getResumePath() == null || student.getResumePath().isBlank()) {
            throw new RuntimeException("Resume not found");
        }

        ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(
                GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(student.getResumePath())
                        .build()
        );

        return new ByteArrayResource(objectBytes.asByteArray());
    }

    public Resource downloadContractTemplate(String filename) {
        String contractKey = "contracts/" + filename;

        ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(
                GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(contractKey)
                        .build()
        );

        return new ByteArrayResource(objectBytes.asByteArray());
    }

    private void validatePdf(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new RuntimeException("Only PDF files are allowed");
        }
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        return lastDotIndex == -1 ? "" : filename.substring(lastDotIndex);
    }

    private String generateResumeFilename(Student student, String extension) {
        String fullName = student.getFullName().replaceAll("[^a-zA-Zа-яА-Я0-9]", "_");
        String group = student.getGroupName().replaceAll("[^a-zA-Z0-9]", "_");
        int course = student.getCourse();

        long timestamp = System.currentTimeMillis();

        return fullName + "_" + group + "_Course_" + course + "_" + timestamp + extension;
    }
}
