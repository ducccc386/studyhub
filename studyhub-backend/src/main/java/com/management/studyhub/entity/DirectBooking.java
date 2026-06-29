package com.management.studyhub.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "direct_bookings")
@Data
public class DirectBooking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private User parent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_id")
    private TutorProfile tutor;

    private String subject;
    private String schedule;
    
    @Column(name = "job_posting_id")
    private Long jobPostingId; // ID bài đăng liên kết (nếu mời qua bài đăng)
    
    @Column(name = "learning_mode")
    private String learningMode;
    
    private String address;
    private BigDecimal pricePerSession;

    @Column(columnDefinition = "TEXT")
    private String parentMessage;

    @Column(length = 20)
    private String status; // PENDING, ACCEPTED, REJECTED

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
