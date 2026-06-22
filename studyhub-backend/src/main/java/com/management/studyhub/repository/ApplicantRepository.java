package com.management.studyhub.repository;

import com.management.studyhub.entity.Applicant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicantRepository extends JpaRepository<Applicant, Long> {
    List<Applicant> findByJobPostingId(Long jobPostingId);
    List<Applicant> findByJobPostingIdAndStatus(Long jobPostingId, String status);
    List<Applicant> findByTutorId(String tutorId);
}
