package com.management.studyhub.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class StudyMaterialDTO {
    private Long id;
    private Long classSessionId;
    private Long uploaderId;
    private String uploaderName;
    private String title;
    private String fileUrl;
    private String fileType;
    private String materialType;
    private LocalDateTime uploadedAt;
}
