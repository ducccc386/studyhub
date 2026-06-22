package com.management.studyhub.controller;

import com.management.studyhub.entity.TutorProfile;
import com.management.studyhub.entity.enums.EkycStatus;
import com.management.studyhub.entity.enums.TutorStatus;
import com.management.studyhub.repository.TutorProfileRepository;
import com.management.studyhub.repository.UserRepository;
import com.management.studyhub.service.EkycApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/ekyc")
@RequiredArgsConstructor
public class AdminEkycController {

    private final TutorProfileRepository tutorProfileRepository;
    private final UserRepository userRepository;
    private final EkycApiService ekycApiService;

    @GetMapping("/pending")
    public ResponseEntity<List<TutorProfile>> getPendingEkyc() {
        List<TutorProfile> pendingProfiles = tutorProfileRepository.findAll().stream()
                .filter(t -> t.getEkycStatus() == EkycStatus.PROCESSING)
                .toList();
        return ResponseEntity.ok(pendingProfiles);
    }

    @PutMapping("/{id}/approve")
    @Transactional
    public ResponseEntity<String> approveEkyc(@PathVariable Long id) {
        TutorProfile tutor = tutorProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tutor not found"));

        if (tutor.getEkycStatus() != EkycStatus.PROCESSING) {
            return ResponseEntity.badRequest().body("Tutor is not in PROCESSING state");
        }

        tutor.setEkycStatus(EkycStatus.SUCCESS);
        tutor.setStatus(TutorStatus.APPROVED);
        tutorProfileRepository.save(tutor);

        // Cập nhật User tương ứng
        if (tutor.getUser() != null) {
            com.management.studyhub.entity.User user = tutor.getUser();
            user.setFullName(tutor.getFullName());
            user.setAvatarUrl(tutor.getAvatarUrl());
            userRepository.save(user);
        }

        return ResponseEntity.ok("Duyệt hồ sơ thành công");
    }

    @PutMapping("/{id}/reject")
    @Transactional
    public ResponseEntity<String> rejectEkyc(@PathVariable Long id, @RequestBody Map<String, String> body) {
        TutorProfile tutor = tutorProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tutor not found"));

        if (tutor.getEkycStatus() != EkycStatus.PROCESSING) {
            return ResponseEntity.badRequest().body("Tutor is not in PROCESSING state");
        }

        String reason = body.getOrDefault("reason", "Hồ sơ không đạt yêu cầu");
        tutor.setEkycStatus(EkycStatus.FAILED);
        tutor.setRejectionReason(reason);
        tutorProfileRepository.save(tutor);

        return ResponseEntity.ok("Đã từ chối hồ sơ");
    }

    @PutMapping("/{id}/re-evaluate")
    @Transactional
    public ResponseEntity<Map<String, Object>> reEvaluateEkyc(@PathVariable Long id) {
        TutorProfile tutor = tutorProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tutor not found"));

        if (tutor.getAvatarUrl() == null || tutor.getIdCardFrontUrl() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Thiếu ảnh Avatar hoặc CCCD"));
        }

        java.math.BigDecimal score = ekycApiService.compareFaces(tutor.getAvatarUrl(), tutor.getIdCardFrontUrl());
        
        if (score != null) {
            tutor.setSimilarityScore(score);
            tutorProfileRepository.save(tutor);
            return ResponseEntity.ok(Map.of(
                "message", "Quét AI thành công",
                "similarityScore", score
            ));
        } else {
            return ResponseEntity.status(500).body(Map.of("error", "AI Face Matching thất bại (Có thể ảnh mờ hoặc không có khuôn mặt)"));
        }
    }
}
