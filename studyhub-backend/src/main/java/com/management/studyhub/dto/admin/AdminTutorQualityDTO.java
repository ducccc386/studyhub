package com.management.studyhub.dto.admin;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminTutorQualityDTO {
    private Long tutorId;
    private String tutorName;
    private String tutorAvatar;
    private Double rating;
    private Long reportCount;
    private String status; // XUẤT SẮC, CẦN DUYỆT, etc.
}
