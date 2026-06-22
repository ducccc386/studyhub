package com.management.studyhub.controller;

import com.management.studyhub.entity.ClassSession;
import com.management.studyhub.repository.ClassSessionRepository;
import com.management.studyhub.repository.CommissionRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * BillingController — Quản lý lịch sử thanh toán và thu nhập của gia sư.
 */
@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
public class BillingController {

    private final ClassSessionRepository classSessionRepository;
    private final CommissionRecordRepository commissionRecordRepository;

    /**
     * Lấy lịch sử thu nhập của gia sư
     * GET /api/v1/billing/tutor/{tutorProfileId}
     */
    @GetMapping("/tutor/{tutorProfileId}")
    public ResponseEntity<?> getBillingByTutor(@PathVariable Long tutorProfileId) {
        try {
            List<ClassSession> sessions = classSessionRepository.findAll().stream()
                    .filter(s -> s.getTutorProfileId() != null
                            && s.getTutorProfileId().equals(tutorProfileId))
                    .collect(Collectors.toList());

            List<Map<String, Object>> result = sessions.stream().map(s -> Map.<String, Object>of(
                    "id", s.getId(),
                    "className", s.getClassName() != null ? s.getClassName() : "Lớp học",
                    "subject", s.getSubject() != null ? s.getSubject() : "",
                    "status", s.getStatus() != null ? s.getStatus().name() : "UNKNOWN",
                    "price", s.getPrice() != null ? s.getPrice() : 0,
                    "pricePerSession", s.getPricePerSession() != null ? s.getPricePerSession() : 0,
                    "parentName", s.getParentName() != null ? s.getParentName() : "Phụ huynh",
                    "createdAt", s.getCreatedAt() != null ? s.getCreatedAt().toString() : ""
            )).collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }
}
