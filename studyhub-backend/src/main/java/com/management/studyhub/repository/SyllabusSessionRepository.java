package com.management.studyhub.repository;

import com.management.studyhub.entity.SyllabusSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SyllabusSessionRepository extends JpaRepository<SyllabusSession, Long> {
    List<SyllabusSession> findByClassSessionIdOrderBySessionNumberAsc(Long classSessionId);
    void deleteByClassSessionId(Long classSessionId);
}
