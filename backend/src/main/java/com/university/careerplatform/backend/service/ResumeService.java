package com.university.careerplatform.backend.service;

import com.university.careerplatform.backend.entity.Student;
import com.university.careerplatform.backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
    private final Path resumeUploadPath;
    private final Path contractsPath;

    public ResumeService(StudentRepository studentRepository,
                         @Value("${file.upload-dir}") String uploadDir,
                         @Value("${file.contracts-dir}") String contractsDir) throws IOException {
        this.studentRepository = studentRepository;
        this.resumeUploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.contractsPath = Paths.get(contractsDir).toAbsolutePath().normalize();

        Files.createDirectories(this.resumeUploadPath);
        Files.createDirectories(this.contractsPath);
    }

    public Student uploadResume(Long studentId, MultipartFile file) throws IOException {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        validatePdf(file);

        String originalFilename = Objects.requireNonNull(file.getOriginalFilename());
        String fileExtension = getFileExtension(originalFilename);

        String generatedFilename = UUID.randomUUID() + fileExtension;
        Path targetLocation = resumeUploadPath.resolve(generatedFilename);

        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        student.setResumePath(targetLocation.toString());
        return studentRepository.save(student);
    }

    public Resource downloadResume(Long studentId) throws IOException {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getResumePath() == null || student.getResumePath().isBlank()) {
            throw new RuntimeException("Resume not found");
        }

        Path filePath = Paths.get(student.getResumePath()).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            throw new RuntimeException("Resume file does not exist");
        }

        return resource;
    }

    public Resource downloadContractTemplate(String filename) throws IOException {
        Path filePath = contractsPath.resolve(filename).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            throw new RuntimeException("Contract template not found");
        }

        return resource;
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
}
