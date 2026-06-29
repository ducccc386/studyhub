package com.management.studyhub.repository.specification;

import com.management.studyhub.entity.Subject;
import com.management.studyhub.entity.TutorProfile;
import com.management.studyhub.entity.enums.TutorStatus;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class TutorSpecification {

    public static Specification<TutorProfile> getTutorsByFilters(
            String keyword, List<Integer> subjectIds, Double minPrice, Double maxPrice,
            Double minRating, String teachingMethod) {
        
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Only fetch active, not deleted tutors
            predicates.add(criteriaBuilder.equal(root.get("isDeleted"), false));
            predicates.add(criteriaBuilder.equal(root.get("status"), TutorStatus.APPROVED));

            // Check if the user is ACTIVE (not locked), allowing NULL for legacy records
            Join<TutorProfile, com.management.studyhub.entity.User> userJoin = root.join("user", JoinType.LEFT);
            predicates.add(criteriaBuilder.or(
                criteriaBuilder.isNull(userJoin.get("status")),
                criteriaBuilder.equal(userJoin.get("status"), "ACTIVE")
            ));

            if (keyword != null && !keyword.trim().isEmpty()) {
                String likeKeyword = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("fullName")), likeKeyword));
            }

            if (subjectIds != null && !subjectIds.isEmpty()) {
                Join<TutorProfile, Subject> subjectJoin = root.join("subjects");
                predicates.add(subjectJoin.get("id").in(subjectIds));
            }

            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            if (minRating != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("averageRating"), minRating));
            }

            if (teachingMethod != null && !teachingMethod.isEmpty() && !teachingMethod.equalsIgnoreCase("ALL")) {
                Predicate methodPredicate = criteriaBuilder.equal(root.get("teachingMethod"), teachingMethod);
                Predicate bothPredicate = criteriaBuilder.equal(root.get("teachingMethod"), "BOTH");
                predicates.add(criteriaBuilder.or(methodPredicate, bothPredicate));
            }

            // Distinct is necessary when joining with subjects to avoid duplicate rows
            query.distinct(true);

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
