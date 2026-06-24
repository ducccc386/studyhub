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

            List<Map<String, Object>> result = sessions.stream().map(s -> {
                double pricePer = s.getPricePerSession() != null ? s.getPricePerSession() : 0;
                int sessionsCount = (s.getProgress() != null && s.getProgress() > 0) ? s.getProgress() : 10;
                double revenue = s.getPrice() != null ? s.getPrice() : pricePer * sessionsCount;
                
                double fee = revenue * 0.15; // 15% platform fee
                double tutorEarning = revenue - fee;
                
                String sStatus = s.getStatus() != null ? s.getStatus().name() : "";
                String invStatus = "PENDING";
                
                if ("DISBURSED".equals(sStatus)) {
                    invStatus = "PAID"; // Tiền đã về ví gia sư
                } else if ("CANCELLED".equals(sStatus)) {
                    invStatus = "CANCELLED";
                }
                
                return Map.<String, Object>of(
                        "id", s.getId(),
                        "month", java.time.YearMonth.now().toString(),
                        "totalSessions", sessionsCount,
                        "totalRevenue", revenue,
                        "platformFeePercent", 15,
                        "platformFeeAmount", fee,
                        "tutorEarnings", tutorEarning,
                        "status", invStatus,
                        "className", s.getClassName() != null ? s.getClassName() : "Lớp học"
                );
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }
}
