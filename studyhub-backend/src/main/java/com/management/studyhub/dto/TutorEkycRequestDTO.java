package com.management.studyhub.dto;

import lombok.Data;

import java.util.List;

@Data
public class TutorEkycRequestDTO {
    // Section 1
    private String fullName;
    private String birthDate;
    private String address;
    private String phoneNumber;

    // Section 2
    private String avatarUrl;
    private String portraitUrl;
    private String idCardFrontUrl;
    private String idCardBackUrl;

    // Section 3 & 4
    private String universityName;
    private String major;
    private String experienceYears;
    private String introduction;
    private String degreeImageUrl;
    private List<String> certificates;
    private Double price;
}
