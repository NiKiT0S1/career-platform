/**
 * Specification class for dynamic multi-parameter student filtering.
 * Builds flexible database queries for admin search and filtering.
 */

package com.university.careerplatform.backend.specification;

import com.university.careerplatform.backend.entity.Student;
import com.university.careerplatform.backend.model.PracticeStatus;
import org.springframework.data.jpa.domain.Specification;

public class StudentSpecification {

    public static Specification<Student> filterStudents(
            String fullName,
            String educationalProgram,
            String groupName,
            Integer course,
            String practiceStatus,
            Double minGpa
    ) {
        return (root, query, criteriaBuilder) -> {
            var predicate = criteriaBuilder.conjunction();

            if (fullName != null && !fullName.isBlank()) {
                String search = fullName.toLowerCase();

                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.or(
                                criteriaBuilder.like(
                                        criteriaBuilder.lower(root.get("fullName")),
                                        search + "%"
                                ),
                                criteriaBuilder.like(
                                        criteriaBuilder.lower(root.get("fullName")),
                                        "% " + search + "%"
                                )
                        )
                );
            }

            if (educationalProgram != null && !educationalProgram.isBlank()) {
                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("educationalProgram")),
                                "%" + educationalProgram.toLowerCase() + "%"
                        )
                );
            }

            if (groupName != null && !groupName.isBlank()) {
                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("groupName")),
                                "%" + groupName.toLowerCase() + "%"
                        )
                );
            }

            if (course != null) {
                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.equal(root.get("course"), course)
                );
            }

            if (practiceStatus != null && !practiceStatus.isBlank()) {
                try {
                    PracticeStatus status = PracticeStatus.valueOf(practiceStatus);
                    predicate = criteriaBuilder.and(
                            predicate,
                            criteriaBuilder.equal(root.get("practiceStatus"), status)
                    );
                }
                catch (IllegalArgumentException e) {
                    throw new RuntimeException("Invalid practice status");
                }
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
