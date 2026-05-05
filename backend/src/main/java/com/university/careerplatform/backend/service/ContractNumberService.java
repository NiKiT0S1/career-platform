package com.university.careerplatform.backend.service;

import com.university.careerplatform.backend.repository.PracticeSettingsRepository;
import com.university.careerplatform.backend.repository.StudentPracticeRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ContractNumberService {

    private final StudentPracticeRepository studentPracticeRepository;
    private final PracticeSettingsService practiceSettingsService;

    public ContractNumberService(StudentPracticeRepository studentPracticeRepository,
                                 PracticeSettingsService practiceSettingsService) {
        this.studentPracticeRepository = studentPracticeRepository;
        this.practiceSettingsService = practiceSettingsService;
    }

    public String getNextContractNumber() {
        Integer academicYearStart = practiceSettingsService.getSettings().getAcademicYearStart();

        if (academicYearStart == null) {
            throw new RuntimeException("Academic year start is not configured");
        }

        String yearCode = buildYearCode(academicYearStart);

        List<String> existingNumbers =
                studentPracticeRepository.findContractNumbersByYearCode("-" + yearCode);

        int maxSequence = existingNumbers.stream()
                .map(this::extractSequence)
                .max(Integer::compareTo)
                .orElse(0);

        int nextSequence = maxSequence + 1;

        return formatContractNumber(nextSequence, yearCode);
    }

    public List<String> generateNextContractNumbers(int count) {
        Integer academicYearStart = practiceSettingsService.getSettings().getAcademicYearStart();

        if (academicYearStart == null) {
            throw new RuntimeException("Academic year start is not configured");
        }

        String yearCode = buildYearCode(academicYearStart);

        List<String> existingNumbers =
                studentPracticeRepository.findContractNumbersByYearCode("-" + yearCode);

        int maxSequence = existingNumbers.stream()
                .map(this::extractSequence)
                .max(Integer::compareTo)
                .orElse(0);

        List<String> generatedNumbers = new ArrayList<>();

        for (int i = 1; i<= count; i++) {
            generatedNumbers.add(formatContractNumber(maxSequence + i, yearCode));
        }

        return generatedNumbers;
    }

    private String buildYearCode(Integer academicYearStart) {
        int nextYear = academicYearStart + 1;

        String start = String.valueOf(academicYearStart).substring(2);
        String end = String.valueOf(nextYear).substring(2);

        return start + end;
    }

    private Integer extractSequence(String contractNumber) {
        try {
            String sequencePart = contractNumber.split("-")[0];
            return Integer.parseInt(sequencePart);
        }
        catch (Exception e) {
            return 0;
        }
    }

    private String formatContractNumber(int sequence, String yearCode) {
        return String.format("%02d-%s", sequence, yearCode);
    }
}
