package com.management.studyhub.repository;

import com.management.studyhub.entity.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    List<JobPosting> findByStatus(String status);

    @org.springframework.data.jpa.repository.Query("SELECT jp FROM JobPosting jp WHERE jp.status = :status AND (jp.parent.user.status IS NULL OR jp.parent.user.status = 'ACTIVE')")
    List<JobPosting> findActiveByStatus(@org.springframework.data.repository.query.Param("status") String status);

    List<JobPosting> findByParentId(Long parentId);
}
