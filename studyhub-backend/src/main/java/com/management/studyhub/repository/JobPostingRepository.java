package com.management.studyhub.repository;

import com.management.studyhub.entity.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    List<JobPosting> findByStatus(String status);

    List<JobPosting> findByParentId(Long parentId);
}
