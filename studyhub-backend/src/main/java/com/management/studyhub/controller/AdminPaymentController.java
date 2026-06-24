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
    public ResponseEntity<List<ClassSession>> getCompletedClasses() {
        return ResponseEntity.ok(paymentService.getCompletedClasses());
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
