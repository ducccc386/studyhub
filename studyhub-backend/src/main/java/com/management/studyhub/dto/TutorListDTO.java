package com.management.studyhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TutorListDTO {
    private Long id;
    private String fullName;
    private String avatarUrl;
    private String universityName;
    private String major;
    private String introduction;
    private String cvUrl;
    private Double price;
    private String teachingMethod;
    private Double averageRating;
    private Integer totalReviews;
    private List<SubjectDTO> subjects;
}
