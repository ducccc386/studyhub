package com.management.studyhub.repository;

import com.management.studyhub.entity.ClassSession;
import com.management.studyhub.entity.enums.ClassSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {
    List<ClassSession> findByStatus(ClassSessionStatus status);
    List<ClassSession> findByParentId(Long parentId);
    List<ClassSession> findByTutorProfileId(Long tutorProfileId);

    @org.springframework.data.jpa.repository.Query("SELECT c.subject, COUNT(c) FROM ClassSession c GROUP BY c.subject ORDER BY COUNT(c) DESC")
    List<Object[]> findPopularSubjects();
}
