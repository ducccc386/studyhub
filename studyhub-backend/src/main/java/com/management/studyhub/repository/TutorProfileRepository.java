package com.management.studyhub.repository;

import com.management.studyhub.entity.TutorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TutorProfileRepository extends JpaRepository<TutorProfile, Long>, JpaSpecificationExecutor<TutorProfile> {
    Optional<TutorProfile> findByUserId(Long userId);
    long countByStatus(com.management.studyhub.entity.enums.TutorStatus status);
    java.util.List<TutorProfile> findByStatus(com.management.studyhub.entity.enums.TutorStatus status);
}
