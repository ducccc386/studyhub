package com.management.studyhub.dto;

import lombok.Data;

@Data
public class ParentConfirmDTO {
    private String status; // APPROVED or DISPUTED
    private Integer rating; // 1 to 5
    private String feedback;
    private String tags;
}
