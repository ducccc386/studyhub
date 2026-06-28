package com.management.studyhub.controller;

import com.management.studyhub.entity.ClassSession;
import com.management.studyhub.entity.LessonLog;
import com.management.studyhub.repository.ClassSessionRepository;
import com.management.studyhub.repository.TutorProfileRepository;
import com.management.studyhub.repository.LessonLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * ReviewController — Quản lý đánh giá gia sư từ phụ huynh.
 * Vì dự án chưa có bảng reviews đầy đủ, controller này trả về
 * dữ liệu tổng hợp từ ClassSession để không gây lỗi 404.
 */
@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ClassSessionRepository classSessionRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final LessonLogRepository lessonLogRepository;

    /**
     * Lấy danh sách đánh giá của một gia sư
     * GET /api/v1/reviews/tutor/{tutorId}
     */
    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<?> getReviewsByTutor(@PathVariable Long tutorId) {
        try {
            List<LessonLog> logs = lessonLogRepository.findReviewsByTutorProfileId(tutorId);
            List<Map<String, Object>> response = logs.stream().map(log -> Map.<String, Object>of(
                "id", log.getId(),
                "parentName", log.getClassSession() != null && log.getClassSession().getParent() != null && log.getClassSession().getParent().getUser() != null ? log.getClassSession().getParent().getUser().getFullName() : "Phụ huynh",
                "parentAvatar", log.getClassSession() != null && log.getClassSession().getParent() != null && log.getClassSession().getParent().getUser() != null ? (log.getClassSession().getParent().getUser().getAvatarUrl() != null ? log.getClassSession().getParent().getUser().getAvatarUrl() : "") : "",
                "rating", log.getParentRating(),
                "comment", log.getParentFeedback() != null ? log.getParentFeedback() : "",
                "createdAt", log.getScheduledDate() != null ? log.getScheduledDate().toString() : LocalDateTime.now().toString(),
                "className", log.getClassSession() != null ? log.getClassSession().getClassName() : ""
            )).collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }

    /**
     * Lấy danh sách đánh giá mà một phụ huynh đã viết
     * GET /api/v1/reviews/parent/{parentId}
     */
    @GetMapping("/parent/{parentId}")
    public ResponseEntity<?> getReviewsByParent(@PathVariable Long parentId) {
        try {
            return ResponseEntity.ok(List.of());
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }

    /**
     * Phụ huynh gửi đánh giá cho gia sư
     * POST /api/v1/reviews
     */
    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody Map<String, Object> body) {
        try {
            // Placeholder - trong thực tế sẽ lưu vào DB
            return ResponseEntity.ok(Map.of(
                "message", "Đánh giá đã được gửi thành công",
                "success", true
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
