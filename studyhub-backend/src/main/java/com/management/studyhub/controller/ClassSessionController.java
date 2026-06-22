package com.management.studyhub.controller;

import com.management.studyhub.dto.ClassSessionDTO;
import com.management.studyhub.service.ClassSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/class-sessions")
@RequiredArgsConstructor
public class ClassSessionController {

    private final ClassSessionService classSessionService;

    /**
     * Phụ huynh chấp nhận 1 ứng viên → tạo ClassSession tự động
     * POST /api/v1/class-sessions/accept-applicant/{applicantId}
     */
    @PostMapping("/accept-applicant/{applicantId}")
    public ResponseEntity<?> acceptApplicant(@PathVariable Long applicantId) {
        try {
            ClassSessionDTO session = classSessionService.acceptApplicant(applicantId);
            return ResponseEntity.ok(session);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reject-applicant/{applicantId}")
    public ResponseEntity<Void> rejectApplicant(@PathVariable Long applicantId) {
        classSessionService.rejectApplicant(applicantId);
        return ResponseEntity.ok().build();
    }

    /**
     * Lấy danh sách lớp học của phụ huynh
     * GET /api/v1/class-sessions/parent/{parentId}
     */
    @GetMapping("/parent/{userId}")
    public ResponseEntity<?> getSessionsByParent(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(classSessionService.getSessionsByParent(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Admin: lấy tất cả lớp học trong hệ thống
     * GET /api/v1/class-sessions/admin/all
     */
    @GetMapping("/admin/all")
    public ResponseEntity<List<ClassSessionDTO>> getAllSessionsForAdmin() {
        return ResponseEntity.ok(classSessionService.getAllSessions());
    }

    @GetMapping("/tutor/{tutorProfileId}")
    public ResponseEntity<List<ClassSessionDTO>> getSessionsByTutor(@PathVariable Long tutorProfileId) {
        return ResponseEntity.ok(classSessionService.getSessionsByTutor(tutorProfileId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassSessionDTO> getSessionById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(classSessionService.getSessionById(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/meeting-link")
    public ResponseEntity<?> updateMeetingLink(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        try {
            String link = payload.get("link");
            return ResponseEntity.ok(classSessionService.updateMeetingLink(id, link));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/address")
    public ResponseEntity<?> updateAddress(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        try {
            String address = payload.get("address");
            return ResponseEntity.ok(classSessionService.updateAddress(id, address));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    /**
     * Cập nhật trạng thái lớp học
     * PUT /api/v1/class-sessions/{id}/status
     * Body: { "status": "CONFIRMED" }
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            String newStatus = body.get("status");
            if (newStatus == null || newStatus.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "status is required"));
            }
            ClassSessionDTO updated = classSessionService.updateStatus(id, newStatus);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/syllabus")
    public ResponseEntity<?> getSyllabus(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(classSessionService.getSyllabus(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/syllabus")
    public ResponseEntity<?> updateSyllabus(
            @PathVariable Long id,
            @RequestBody com.management.studyhub.dto.ClassSyllabusDTO dto) {
        try {
            return ResponseEntity.ok(classSessionService.updateSyllabus(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/syllabus/submit")
    public ResponseEntity<?> submitSyllabus(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(classSessionService.submitSyllabus(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/syllabus/approve")
    public ResponseEntity<?> approveSyllabus(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(classSessionService.approveSyllabus(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
