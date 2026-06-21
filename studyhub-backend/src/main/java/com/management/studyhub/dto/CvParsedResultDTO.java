package com.management.studyhub.dto;

import lombok.Data;

@Data
public class CvParsedResultDTO {
    private String fullName;
    private String phoneNumber;
    private String email;
    private String universityName;
    private String major;
    private Integer experienceYears;
    private String introduction;
}
