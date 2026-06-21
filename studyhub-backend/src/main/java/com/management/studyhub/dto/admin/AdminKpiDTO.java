package com.management.studyhub.dto.admin;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class AdminKpiDTO {
    private Long activeTutors;
    private Double activeTutorsGrowth; // Percent growth
    private Double averageRating;
}
