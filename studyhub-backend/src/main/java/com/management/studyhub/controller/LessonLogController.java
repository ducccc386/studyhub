package com.management.studyhub.controller;

import com.management.studyhub.dto.LessonLogDTO;
import com.management.studyhub.service.LessonLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lesson-logs")
@RequiredArgsConstructor
public class LessonLogController {

    private final LessonLogService lessonLogService;

    @GetMapping("/class/{classSessionId}")
    public ResponseEntity<List<LessonLogDTO>> getLogsByClassSession(@PathVariable Long classSessionId) {
        return ResponseEntity.ok(lessonLogService.getLessonLogsByClassSessionId(classSessionId));
    }

    @PostMapping("/class/{classSessionId}")
    public ResponseEntity<?> createLessonLog(@PathVariable Long classSessionId, @RequestBody LessonLogDTO dto) {
        try {
            return ResponseEntity.ok(lessonLogService.createLessonLog(classSessionId, dto));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage() != null ? e.getMessage() : "Lỗi không xác định"));
        }
    }

    @PutMapping("/{id}/parent-confirm")
    public ResponseEntity<?> parentConfirmLesson(@PathVariable Long id, @RequestBody com.management.studyhub.dto.ParentConfirmDTO dto) {
        try {
            return ResponseEntity.ok(lessonLogService.parentConfirmLesson(id, dto));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage() != null ? e.getMessage() : "Lỗi không xác định"));
        }
    }

    @GetMapping("/parent/{userId}/pending")
    public ResponseEntity<List<LessonLogDTO>> getPendingLogsForParent(@PathVariable Long userId) {
        return ResponseEntity.ok(lessonLogService.getPendingLogsForParent(userId));
    }

    @GetMapping("/parent/{userId}/reviewed")
    public ResponseEntity<List<LessonLogDTO>> getReviewedLogsForParent(@PathVariable Long userId) {
        return ResponseEntity.ok(lessonLogService.getReviewedLogsForParent(userId));
    }
}
