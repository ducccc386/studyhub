package com.management.studyhub.controller;

import com.management.studyhub.entity.enums.TransactionStatus;
import com.management.studyhub.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/confirm-hire/{classId}")
    public ResponseEntity<?> confirmHire(@PathVariable Long classId) {
        try {
            Map<String, String> result = paymentService.generatePaymentQR(classId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "qrUrl", result.get("qrUrl"),
                "transactionCode", result.get("transactionCode")
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/status/{transactionCode}")
    public ResponseEntity<?> getStatus(@PathVariable String transactionCode) {
        try {
            TransactionStatus status = paymentService.getTransactionStatus(transactionCode);
            return ResponseEntity.ok(Map.of(
                "status", status.name()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/mock-pay/{transactionCode}")
    public ResponseEntity<?> mockPay(@PathVariable String transactionCode) {
        try {
            paymentService.mockPay(transactionCode);
            return ResponseEntity.ok(Map.of("success", true, "message", "Mock payment processed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(
            @RequestHeader(value = "Casso-Signature", required = false) String signature,
            @RequestBody Map<String, Object> payload) {
        
        // Simple security check (in real app, this should cryptographically verify the payload)
        if (!"mock".equalsIgnoreCase(signature) && (signature == null || signature.isEmpty())) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing Signature"));
        }
        
        paymentService.handleWebhook(payload);
        
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/history/parent/{parentId}")
    public ResponseEntity<?> getTransactionsByParent(@PathVariable Long parentId) {
        try {
            return ResponseEntity.ok(paymentService.getTransactionsByParent(parentId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/admin/history")
    public ResponseEntity<?> getAllTransactions() {
        try {
            return ResponseEntity.ok(paymentService.getAllTransactions());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
