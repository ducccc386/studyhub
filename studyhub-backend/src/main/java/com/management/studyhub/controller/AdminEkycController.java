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
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getPendingEkyc() {
        // findByEkycStatus dùng JOIN FETCH user + subjects → chỉ 1 câu SQL, không có N+1
        List<Map<String, Object>> pendingProfiles = tutorProfileRepository.findByEkycStatus(EkycStatus.PROCESSING)
                .stream()
                .map(t -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", t.getId());
                    map.put("fullName", t.getFullName());
                    map.put("avatarUrl", t.getAvatarUrl());
                    if (t.getUser() != null) {
                        map.put("user", Map.of("email", t.getUser().getEmail() != null ? t.getUser().getEmail() : ""));
                    }
                    if (t.getSubjects() != null) {
                        map.put("subjects", t.getSubjects().stream().map(s -> Map.of("id", s.getId(), "name", s.getName())).toList());
                    }
                    map.put("createdAt", t.getCreatedAt());
                    map.put("idCardFrontUrl", t.getIdCardFrontUrl());
                    map.put("idCardBackUrl", t.getIdCardBackUrl());
                    map.put("portraitUrl", t.getPortraitUrl());
                    map.put("birthDate", t.getBirthDate());
                    map.put("phoneNumber", t.getPhoneNumber());
                    map.put("address", t.getAddress());
                    map.put("similarityScore", t.getSimilarityScore());
                    map.put("degreeImageUrl", t.getDegreeImageUrl());
                    map.put("universityName", t.getUniversityName());
                    map.put("major", t.getMajor());
                    map.put("experienceYears", t.getExperienceYears());
                    map.put("certificates", t.getCertificates() != null ? new java.util.ArrayList<>(t.getCertificates()) : java.util.List.of());
                    map.put("introduction", t.getIntroduction());
                    map.put("price", t.getPrice());
                    return map;
                })
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

    // Bỏ @Transactional ở đây: nếu giữ @Transactional thì kết nối DB sẽ bị giữ trong suốt thời gian chờ gọi API Face++ (có thể mất vài giây),
    // gây cạn kiệt HikariPool khi có nhiều request đồng thời.
    @PutMapping("/{id}/re-evaluate")
    public ResponseEntity<Map<String, Object>> reEvaluateEkyc(@PathVariable Long id) {
        // Bước 1: Đọc dữ liệu — kết nối DB mở & đóng ngay sau khi lấy xong
        final String avatarUrl;
        final String idCardFrontUrl;
        try {
            TutorProfile tutor = tutorProfileRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Tutor not found"));
            if (tutor.getAvatarUrl() == null || tutor.getIdCardFrontUrl() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Thiếu ảnh Avatar hoặc CCCD"));
            }
            avatarUrl = tutor.getAvatarUrl();
            idCardFrontUrl = tutor.getIdCardFrontUrl();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }

        // Bước 2: Gọi API Face++ — không giữ kết nối DB trong bước này
        java.math.BigDecimal score = ekycApiService.compareFaces(avatarUrl, idCardFrontUrl);

        if (score == null) {
            return ResponseEntity.status(500).body(Map.of("error", "AI Face Matching thất bại (Có thể ảnh mờ hoặc không có khuôn mặt)"));
        }

        // Bước 3: Cập nhật kết quả vào DB — transaction nhỏ, chỉ lúc save
        TutorProfile tutorToUpdate = tutorProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tutor not found"));
        tutorToUpdate.setSimilarityScore(score);
        tutorProfileRepository.save(tutorToUpdate);

        return ResponseEntity.ok(Map.of(
            "message", "Quét AI thành công",
            "similarityScore", score
        ));
    }
}
