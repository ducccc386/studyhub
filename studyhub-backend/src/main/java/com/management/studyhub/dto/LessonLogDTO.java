package com.management.studyhub.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LessonLogDTO {
    private Long id;
    private Long classSessionId;
    private String className;
    private String tutorName;
    private String tutorAvatar;
    private LocalDateTime scheduledDate;
    private String title;
    private String content;
    private String tutorFeedback;
    private String status;
    private String parentApprovalStatus;
    private Integer parentRating;
    private String parentFeedback;
    private String parentFeedbackTags;
}
