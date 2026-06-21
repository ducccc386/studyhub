package com.management.studyhub.entity;

import com.management.studyhub.entity.enums.EkycStatus;
import com.management.studyhub.entity.enums.TutorStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

// TutorProfile.java
@Entity
@Table(name = "tutor_profiles") @Data
public class TutorProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private String fullName;
    private LocalDate birthDate;
    private String address;
    private String phoneNumber;
    @Column(columnDefinition = "LONGTEXT")
    private String avatarUrl;
    
    @Column(columnDefinition = "LONGTEXT")
    private String portraitUrl;
    
    @Column(columnDefinition = "LONGTEXT")
    private String idCardFrontUrl;
    
    @Column(columnDefinition = "LONGTEXT")
    private String idCardBackUrl;
    
    private String universityName;
    private String major;
    
    @Column(columnDefinition = "LONGTEXT")
    private String degreeImageUrl;
    
    private int experienceYears;

    @ElementCollection
    @CollectionTable(name = "tutor_certificates", joinColumns = @JoinColumn(name = "tutor_profile_id"))
    @Column(name = "certificate_url", columnDefinition = "LONGTEXT")
    private List<String> certificates;

    @Column(columnDefinition = "TEXT") // Sửa NVARCHAR(MAX) thành TEXT
    private String introduction;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TutorStatus status;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EkycStatus ekycStatus; // NOT_STARTED, PROCESSING, SUCCESS, FAILED
    private BigDecimal similarityScore;

    @Column(columnDefinition = "TEXT") // Sửa NVARCHAR(MAX) thành TEXT
    private String rejectionReason;

    private boolean isDeleted = false;

    private Double price;
    
    @Column(length = 20)
    private String teachingMethod; // ONLINE, OFFLINE, BOTH
    
    private Double averageRating = 0.0;
    private Integer totalReviews = 0;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "tutor_subjects",
        joinColumns = @JoinColumn(name = "tutor_profile_id"),
        inverseJoinColumns = @JoinColumn(name = "subject_id")
    )
    private Set<Subject> subjects;
}
