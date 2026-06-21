package com.management.studyhub.dto;

import lombok.Data;

@Data
public class CourseDto {
    private Long id;
    private String title;
    private String description;
    private String location;
    private String locationType;
    private String price;
    private String image;
    private String schedule;
    private String status;
    
    // Convert to String for frontend compatibility
    private String rating; 
    private Integer reviewCount;

    // Tutor info
    private Long tutorId;
    private String tutorName;
    private String tutorDesc;
    private String tutorAvatar;
    private String tutorAddress;
    private String tutorExperience;
    private Boolean tutorVerified;
    private String tutorUniversity;
    private String tutorMajor;

    // Subject info
    private Integer subjectId;
    private String subjectName;
}
