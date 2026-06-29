package com.management.studyhub.repository;

import com.management.studyhub.entity.TutorProfile;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TutorProfileRepository extends JpaRepository<TutorProfile, Long>, JpaSpecificationExecutor<TutorProfile> {

    Optional<TutorProfile> findByUserId(Long userId);

    long countByStatus(com.management.studyhub.entity.enums.TutorStatus status);

    List<TutorProfile> findByStatus(com.management.studyhub.entity.enums.TutorStatus status);

    /**
     * Fetch tutors with their subjects in 1 query to avoid N+1 problem.
     * Used after Specification pagination to eagerly load subjects.
     */
    @Query("SELECT DISTINCT t FROM TutorProfile t LEFT JOIN FETCH t.subjects s LEFT JOIN FETCH t.user u WHERE t.id IN :ids")
    List<TutorProfile> findAllWithSubjectsByIdIn(@Param("ids") List<Long> ids);
}
