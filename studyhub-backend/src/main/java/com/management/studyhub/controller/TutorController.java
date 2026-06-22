package com.management.studyhub.controller;

import com.management.studyhub.dto.PageResponseDTO;
import com.management.studyhub.dto.TutorListDTO;
import com.management.studyhub.service.TutorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import com.management.studyhub.dto.TutorEkycRequestDTO;

@RestController
@RequestMapping("/api/v1/tutors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow frontend to access
public class TutorController {

    private final TutorService tutorService;
    private final com.management.studyhub.service.GeminiAiService geminiAiService;

    @GetMapping
    public ResponseEntity<PageResponseDTO<TutorListDTO>> getTutors(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<Integer> subjectIds,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) String teachingMethod,
            @RequestParam(defaultValue = "popular") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponseDTO<TutorListDTO> response = tutorService.searchTutors(
                keyword, subjectIds, minPrice, maxPrice, minRating, teachingMethod, sortBy, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<com.management.studyhub.entity.TutorProfile> getTutor(@PathVariable Long id) {
        return ResponseEntity.ok(tutorService.getTutorProfile(id));
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<?> getTutorByUserId(@PathVariable Long userId) {
        try {
            com.management.studyhub.entity.TutorProfile profile =
                tutorService.getTutorProfileByUserId(userId);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/ekyc")
    public ResponseEntity<?> updateEkycProfile(
            @PathVariable Long id,
            @RequestBody TutorEkycRequestDTO request) {
        try {
            Map<String, Object> result = tutorService.processEkyc(id, request);
            boolean success = (boolean) result.get("success");
            if (success) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "score", 0,
                "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/verify-ekyc")
    public ResponseEntity<?> verifyEkycScore(@RequestBody TutorEkycRequestDTO request) {
        try {
            Map<String, Object> result = tutorService.verifyEkyc(request);
            boolean success = (boolean) result.get("success");
            if (success) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "score", 0,
                "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/parse-cv")
    public ResponseEntity<?> parseCv(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            com.management.studyhub.dto.CvParsedResultDTO result = geminiAiService.parseCv(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Server đang có vấn đề, vui lòng thử lại sau."
            ));
        }
    }

    @PostMapping("/{id}/avatar")
    public ResponseEntity<?> updateAvatar(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            tutorService.updateAvatar(id, body.get("avatarUrl"));
            return ResponseEntity.ok(Map.of("success", true, "message", "Cập nhật ảnh đại diện thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
