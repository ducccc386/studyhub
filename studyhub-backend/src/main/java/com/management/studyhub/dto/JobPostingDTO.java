package com.management.studyhub.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class JobPostingDTO {
    private Long id;
    private Long parentId;
    private String parentName;
    private String parentAvatar;
    private String title;
    private String subject;
    private String classLevel;
    private String description;
    private LocalDateTime postedAt;
    private String status;
    private String location;
    private String detailedAddress;
    private String schedule;
    private Double pricePerSession;
    private String learningMode;
    private String requirement;
    private String studentName;
    private Integer applicantsCount;
    private List<ApplicantDTO> applicants;
}
