package com.management.studyhub.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ClassSessionDTO {
    private Long id;
    private Long postId;
    private Long parentId;
    private String parentName;
    private Long tutorProfileId;
    private String tutorName;
    private String tutorAvatar;
    private String className;
    private String subject;
    private String schedule;
    private String learningMode;
    private String address;
    private String meetingLink;
    private String status;
    private Double pricePerSession;
    private Integer progress;
    private String syllabusType;
    private String syllabusStatus;
    private LocalDateTime createdAt;
    private LocalDateTime nextSessionDate;
}
