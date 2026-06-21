package com.management.studyhub.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "syllabus_sessions")
@Data
public class SyllabusSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_session_id", nullable = false)
    @JsonIgnore
    private ClassSession classSession;

    private Integer sessionNumber; // Buổi số mấy

    private String title; // Tên bài học

    @Column(columnDefinition = "TEXT")
    private String content; // Nội dung bài học

    @Column(columnDefinition = "TEXT")
    private String keyKnowledge; // Kiến thức trọng tâm

    @Column(columnDefinition = "TEXT")
    private String expectedOutcome; // Kết quả đầu ra

    private LocalDateTime scheduledDate; // Ngày học dự kiến
}
