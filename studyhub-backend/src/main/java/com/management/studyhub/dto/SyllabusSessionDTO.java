package com.management.studyhub.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SyllabusSessionDTO {
    private Long id;
    private Integer sessionNumber;
    private String title;
    private String content;
    private String keyKnowledge;
    private String expectedOutcome;
    private LocalDateTime scheduledDate;
}
