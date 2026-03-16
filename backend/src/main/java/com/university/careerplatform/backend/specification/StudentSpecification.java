/**
 * Specification class for dynamic multi-parameter student filtering.
 * Builds flexible database queries for admin search and filtering.
 */

package com.university.careerplatform.backend.specification;

import com.university.careerplatform.backend.entity.Student;
import org.springframework.data.jpa.domain.Specification;

public class StudentSpecification {

    public static Specification<Student> filterStudents(
            String educationalProgram,
            Integer course,
            String practiceStatus,
            Double minGpa
    ) {
        return (root, query, criteriaBuilder) -> {
            var predicate = criteriaBuilder.conjunction();

            if (educationalProgram != null && !educationalProgram.isBlank()) {
                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.equal(root.get("educationalProgram"), educationalProgram)
                );
            }

            if (course != null) {
                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.equal(root.get("course"), course)
                );
            }

            if (practiceStatus != null && !practiceStatus.isBlank()) {
                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.equal(root.get("practiceStatus"), practiceStatus)
                );
            }

            if (minGpa != null) {
                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.greaterThanOrEqualTo(root.get("gpa"), minGpa)
                );
            }

            return predicate;
        };
    }
}
