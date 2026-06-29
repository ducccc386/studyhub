package com.management.studyhub.service;

import com.management.studyhub.dto.CourseDto;

import java.util.List;

public interface CourseService {
    List<CourseDto> getFeaturedCourses();
    List<CourseDto> getAllCourses(List<Integer> subjectIds, Double maxPrice, String teachingMethod, List<String> grades, String keyword);
    
    // Tutor Course Posting Workflow
    CourseDto createCourse(Long tutorId, CourseDto courseDto);
    List<CourseDto> getPendingCourses();
    CourseDto approveCourse(Long id);
    CourseDto rejectCourse(Long id);
    CourseDto getCourseById(Long id);

    // Tutor Post Management
    List<CourseDto> getCoursesByTutorId(Long tutorId);
    CourseDto updateCourse(Long id, CourseDto courseDto);
    void deleteCourse(Long id);
}
