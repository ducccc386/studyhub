package com.management.studyhub.controller;

import com.management.studyhub.entity.ClassSession;
import com.management.studyhub.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/payment")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final PaymentService paymentService;
    private final com.management.studyhub.repository.CommissionRecordRepository commissionRecordRepository;

    @DeleteMapping("/reset-commissions")
    public ResponseEntity<?> resetCommissions() {
        commissionRecordRepository.deleteAll();
        return ResponseEntity.ok(Map.of("success", true, "message", "Commissions reset"));
    }

    @GetMapping("/completed-classes")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<?> getCompletedClasses() {
        List<ClassSession> classes = paymentService.getCompletedClasses();
        List<Map<String, Object>> response = classes.stream().map(c -> {
            return Map.<String, Object>of(
                "id", c.getId(),
                "className", c.getClassName() != null ? c.getClassName() : "Không tên",
                "tutorName", c.getTutorName() != null ? c.getTutorName() : "Chưa có",
                "price", c.getPrice() != null ? c.getPrice() : 0.0,
                "status", c.getStatus().name()
            );
        }).toList();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/disburse/{classId}")
    public ResponseEntity<?> disbursePayment(@PathVariable Long classId) {
        try {
            paymentService.disburseClass(classId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Disbursed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
