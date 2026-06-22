package com.management.studyhub.controller;

import com.management.studyhub.dto.EnrollmentDto;
import com.management.studyhub.dto.EnrollmentRequestDto;
import com.management.studyhub.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping
    public ResponseEntity<EnrollmentDto> createEnrollment(
            @RequestParam Long parentId,
            @RequestBody EnrollmentRequestDto requestDto) {
        return ResponseEntity.ok(enrollmentService.createEnrollment(parentId, requestDto));
    }

    @GetMapping("/parent/{parentId}")
    public ResponseEntity<List<EnrollmentDto>> getEnrollmentsByParent(@PathVariable Long parentId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByParentId(parentId));
    }

    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<List<EnrollmentDto>> getEnrollmentsByTutor(@PathVariable Long tutorId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByTutorId(tutorId));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<EnrollmentDto> approveEnrollment(@PathVariable Long id) {
        return ResponseEntity.ok(enrollmentService.approveEnrollment(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<EnrollmentDto> rejectEnrollment(@PathVariable Long id) {
        return ResponseEntity.ok(enrollmentService.rejectEnrollment(id));
    }
}
