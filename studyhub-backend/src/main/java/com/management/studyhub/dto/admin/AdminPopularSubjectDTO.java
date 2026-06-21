package com.management.studyhub.dto.admin;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class AdminPopularSubjectDTO {
    private String subject;
    private Long count;
    private Integer percentage;
}
