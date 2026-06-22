package com.management.studyhub.controller;

import com.management.studyhub.dto.CourseDto;
import com.management.studyhub.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping("/featured")
    public ResponseEntity<List<CourseDto>> getFeaturedCourses() {
        return ResponseEntity.ok(courseService.getFeaturedCourses());
    }

    @GetMapping
    public ResponseEntity<List<CourseDto>> getAllCourses(
            @org.springframework.web.bind.annotation.RequestParam(required = false) List<Integer> subjectIds,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Double maxPrice,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String teachingMethod,
            @org.springframework.web.bind.annotation.RequestParam(required = false) List<String> grades,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(courseService.getAllCourses(subjectIds, maxPrice, teachingMethod, grades, keyword));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDto> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    // --- Tutor Course Posting API ---
    @PostMapping
    public ResponseEntity<CourseDto> createCourse(
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long tutorId,
            @RequestBody CourseDto courseDto) {
        return ResponseEntity.ok(courseService.createCourse(tutorId, courseDto));
    }

    // --- Admin Course Approval API ---
    @GetMapping("/admin/pending")
    public ResponseEntity<List<CourseDto>> getPendingCourses() {
        return ResponseEntity.ok(courseService.getPendingCourses());
    }

    @PutMapping("/admin/{id}/approve")
    public ResponseEntity<CourseDto> approveCourse(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.approveCourse(id));
    }

    @PutMapping("/admin/{id}/reject")
    public ResponseEntity<CourseDto> rejectCourse(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.rejectCourse(id));
    }
}
