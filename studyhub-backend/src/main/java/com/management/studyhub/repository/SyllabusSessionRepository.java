package com.management.studyhub.repository;

import com.management.studyhub.entity.SyllabusSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SyllabusSessionRepository extends JpaRepository<SyllabusSession, Long> {
    List<SyllabusSession> findByClassSessionIdOrderBySessionNumberAsc(Long classSessionId);
    void deleteByClassSessionId(Long classSessionId);
}
