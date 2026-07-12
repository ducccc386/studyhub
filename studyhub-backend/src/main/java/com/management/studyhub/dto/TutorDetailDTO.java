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
public class TutorDetailDTO {
    private Long id;
    private String fullName;
    private String avatarUrl;
    private String universityName;
    private String major;
    private String introduction;
    private String cvUrl;
    private String degreeImageUrl;
    private Double price;
    private String teachingMethod;
    private Double averageRating;
    private Integer totalReviews;
    private int experienceYears;
    private String ekycStatus;
    private String address;
    private String birthDate;
    private String phoneNumber;
    private List<String> certificates;
    private List<SubjectDTO> subjects;
}
