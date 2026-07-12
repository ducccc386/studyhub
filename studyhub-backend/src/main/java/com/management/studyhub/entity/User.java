package com.management.studyhub.entity;

import com.management.studyhub.entity.enums.UserRole;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "users") @Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role; // ADMIN, PARENT, TUTOR
    
    private String fullName;
    
    @Column(columnDefinition = "LONGTEXT")
    private String avatarUrl;

    @Column(length = 20)
    private String phoneNumber;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 200)
    private String childrenName;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(length = 20)
    private String status = "ACTIVE";
}
