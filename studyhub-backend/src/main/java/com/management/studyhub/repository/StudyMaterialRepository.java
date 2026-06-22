package com.management.studyhub.repository;

import com.management.studyhub.entity.StudyMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudyMaterialRepository extends JpaRepository<StudyMaterial, Long> {
    List<StudyMaterial> findByClassSessionIdOrderByUploadedAtDesc(Long classSessionId);
}
