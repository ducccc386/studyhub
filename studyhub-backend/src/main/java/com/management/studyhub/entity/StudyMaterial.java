package com.management.studyhub.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "study_materials")
@Data
public class StudyMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Liên kết với lớp học
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_session_id", nullable = false)
    private ClassSession classSession;

    // Người tải lên (Gia sư hoặc Phụ huynh)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploader_id", nullable = false)
    private User uploader;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false) // Dùng TEXT cho MySQL
    private String fileUrl;

    @Column(length = 50)
    private String fileType; // pdf, docx, png, jpg...

    @Column(name = "material_type", length = 30)
    private String materialType; // OFFICIAL, REFERENCE

    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
        if (materialType == null) {
            materialType = "REFERENCE";
        }
    }
}
