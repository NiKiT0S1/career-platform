/**
 * ================================
 * StudentExportService
 * ================================
 * Service for exporting students data to Excel format.
 *
 * Responsibilities:
 * - Generates XLSX file with student data
 * - Includes student profile fields
 * - Includes practice-related fields
 * - Supports export for filtered, sorted or selected students
 *
 * Notes:
 * - Uses Apache POI for Excel generation
 * - Returns byte array for file download response
 * - Uses fixed column widths for better export performance
 * ================================
 */

package com.university.careerplatform.backend.service;

import com.university.careerplatform.backend.entity.Student;
import com.university.careerplatform.backend.entity.StudentPractice;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class StudentExportService {

    public byte[] exportStudentsToExcel(List<Student> students) {
//        try (Workbook workbook = new XSSFWorkbook();
        try (SXSSFWorkbook workbook = new SXSSFWorkbook(100);
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Students");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            Row header = sheet.createRow(0);

            String[] columns = {
                    "ID",
                    "Full Name",
                    "Email",
                    "Group",
                    "Course",
                    "Educational Program",
                    "Phone",
                    "GPA",
                    "Company",
                    "Practice Status",
                    "Practice Mode",
                    "Practice Start Date",
                    "Practice End Date",
                    "Document Type",
                    "Letter Sent",
                    "Contract Number",
                    "Contract Date",
                    "Resume Uploaded"
            };

            for (int i = 0; i < columns.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIndex = 1;

            for (Student student : students) {
                StudentPractice practice = student.getPractice();

                Row row = sheet.createRow(rowIndex++);

                row.createCell(0).setCellValue(student.getId());
                row.createCell(1).setCellValue(value(student.getFullName()));
                row.createCell(2).setCellValue(value(student.getEmail()));
                row.createCell(3).setCellValue(value(student.getGroupName()));
                row.createCell(4).setCellValue(student.getCourse() != null ? student.getCourse() : 0);
                row.createCell(5).setCellValue(value(student.getEducationalProgram()));
                row.createCell(6).setCellValue(value(student.getPhone()));
                row.createCell(7).setCellValue(student.getGpa() != null ? student.getGpa() : 0);

                row.createCell(8).setCellValue(practice != null ? value(practice.getCompanyName()) : "");
                row.createCell(9).setCellValue(practice != null && practice.getPracticeStatus() != null ? practice.getPracticeStatus().name() : "");
                row.createCell(10).setCellValue(practice != null && practice.getPracticeMode() != null ? practice.getPracticeMode().name() : "");
                row.createCell(11).setCellValue(practice != null && practice.getPracticeStartDate() != null ? practice.getPracticeStartDate().toString() : "");
                row.createCell(12).setCellValue(practice != null && practice.getPracticeEndDate() != null ? practice.getPracticeEndDate().toString() : "");
                row.createCell(13).setCellValue(practice != null && practice.getDocumentType() != null ? practice.getDocumentType().name() : "");
                row.createCell(14).setCellValue(practice != null && practice.getLetterSent() != null ? (practice.getLetterSent() ? "Yes" : "No") : "");
                row.createCell(15).setCellValue(practice != null ? value(practice.getContractNumber()) : "");
                row.createCell(16).setCellValue(practice != null && practice.getContractDate() != null ? practice.getContractDate().toString() : "");
                row.createCell(17).setCellValue(student.getResumePath() != null ? "Yes" : "No");
            }

//            for (int i = 0; i < columns.length; i++) {
//                sheet.autoSizeColumn(i);
//            }

            for (int i = 0; i < columns.length; i++) {
                sheet.setColumnWidth(i, 6000);
            }

            workbook.write(outputStream);

            workbook.dispose();

            return outputStream.toByteArray();
        }
        catch (Exception e) {
            throw new RuntimeException("Failed to export students to Excel", e);
        }
    }

    private String value(String value) {
        return value != null ? value : "";
    }
}
