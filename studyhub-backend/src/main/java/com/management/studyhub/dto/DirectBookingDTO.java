package com.management.studyhub.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DirectBookingDTO {
    private Long id;
    private Long parentId;
    private String parentName;
    private String parentAvatarUrl;
    
    private Long tutorId; // Thường là ID của profile hoặc ID user của gia sư
    private String tutorName;
    private String tutorAvatarUrl;
    
    private Long jobPostingId; // ID bài đăng liên kết (nếu có)
    private String subject;
    private String schedule;
    private String learningMode;
    private String address;
    private BigDecimal pricePerSession;
    private String parentMessage;
    private String status;
    private LocalDateTime createdAt;
}
