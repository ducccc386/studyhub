package com.management.studyhub.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "public_documents")
@Data
public class PublicDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String fileUrl;

    private Long uploadedBy; // Admin ID

    private LocalDateTime uploadedAt;

    private String schoolLevel; // "Cấp 1", "Cấp 2", "Cấp 3"

    private String category; // "Đề thi", "Sách giáo khoa", "Tài liệu chuyên đề", v.v.

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }
}
