package com.management.studyhub.dto.admin;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class AdminGrowthDTO {
    private String month;
    private Long newUsers;
}
