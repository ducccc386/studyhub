package com.management.studyhub.controller;

import com.management.studyhub.dto.ApplicantDTO;
import com.management.studyhub.dto.JobPostingDTO;
import com.management.studyhub.service.JobPostingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class JobPostingController {

    private final JobPostingService jobPostingService;
    @PostMapping
    public ResponseEntity<JobPostingDTO> createPost(@RequestParam Long userId, @RequestBody JobPostingDTO dto) {
        JobPostingDTO createdPost = jobPostingService.createPost(userId, dto);
        return ResponseEntity.ok(createdPost);
    }

    @GetMapping
    public ResponseEntity<List<JobPostingDTO>> getAllRecruitingPosts() {
        return ResponseEntity.ok(jobPostingService.getAllRecruitingPosts());
    }

    @GetMapping("/parent/{userId}")
    public ResponseEntity<List<JobPostingDTO>> getPostsByParent(@PathVariable Long userId) {
        return ResponseEntity.ok(jobPostingService.getPostsByParent(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobPostingDTO> getPostById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(jobPostingService.getPostById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Admin endpoints
    @GetMapping("/admin/pending")
    public ResponseEntity<List<JobPostingDTO>> getPendingPosts() {
        return ResponseEntity.ok(jobPostingService.getPendingPosts());
    }

    @PutMapping("/admin/{id}/approve")
    public ResponseEntity<Void> approvePost(@PathVariable Long id) {
        jobPostingService.approvePost(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/admin/{id}/reject")
    public ResponseEntity<Void> rejectPost(@PathVariable Long id) {
        jobPostingService.rejectPost(id);
        return ResponseEntity.ok().build();
    }

    // ── Applicant endpoints ──────────────────────────────────────────────

    /**
     * Lấy danh sách đơn ứng tuyển của 1 gia sư
     * GET /api/v1/posts/my-applications/{tutorProfileId}
     */
    @GetMapping("/my-applications/{tutorProfileId}")
    public ResponseEntity<List<ApplicantDTO>> getMyApplications(@PathVariable Long tutorProfileId) {
        return ResponseEntity.ok(jobPostingService.getMyApplications(tutorProfileId));
    }

    /**
     * Lấy danh sách ứng viên đã apply cho 1 bài đăng
     * GET /api/v1/posts/{postId}/applicants
     */
    @GetMapping("/{postId}/applicants")
    public ResponseEntity<List<ApplicantDTO>> getApplicantsByPost(@PathVariable Long postId) {
        return ResponseEntity.ok(jobPostingService.getApplicantsByPost(postId));
    }

    /**
     * Gia sư nộp đơn ứng tuyển
     * POST /api/v1/posts/{postId}/apply
     * Body: { tutorProfileId, tutorName, tutorAvatar, tutorTitle, message }
     */
    @PostMapping("/{postId}/apply")
    public ResponseEntity<?> applyToPost(
            @PathVariable Long postId,
            @RequestBody Map<String, Object> body) {
        try {
            Long tutorProfileId = Long.parseLong(body.get("tutorProfileId").toString());
            String tutorName   = (String) body.getOrDefault("tutorName", "");
            String tutorAvatar = (String) body.getOrDefault("tutorAvatar", "");
            String tutorTitle  = (String) body.getOrDefault("tutorTitle", "");
            String message     = (String) body.getOrDefault("message", "");
            ApplicantDTO dto = jobPostingService.applyToPost(
                    postId, tutorProfileId, tutorName, tutorAvatar, tutorTitle, message);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
