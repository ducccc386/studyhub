package com.management.studyhub.controller;

import com.management.studyhub.entity.ClassSession;
import com.management.studyhub.entity.Transaction;
import com.management.studyhub.entity.enums.ClassSessionStatus;
import com.management.studyhub.entity.enums.TransactionStatus;
import com.management.studyhub.entity.enums.TransactionType;
import com.management.studyhub.entity.CommissionRecord;
import com.management.studyhub.repository.ClassSessionRepository;
import com.management.studyhub.repository.TransactionRepository;
import com.management.studyhub.repository.CommissionRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final ClassSessionRepository classSessionRepository;
    private final TransactionRepository transactionRepository;
    private final CommissionRecordRepository commissionRecordRepository;

    private double calculateTotalPrice(ClassSession session) {
        if (session.getPrice() != null && session.getPrice() > 0) {
            return session.getPrice();
        }
        // Fallback: assume 10 sessions if progress is 0
        int sessionsCount = (session.getProgress() != null && session.getProgress() > 0) ? session.getProgress() : 10;
        double pricePer = session.getPricePerSession() != null ? session.getPricePerSession() : 0;
        return pricePer * sessionsCount;
    }

    private String generateVietQR(double amount, String transactionCode) {
        long amountStr = (long) amount;
        String accountNameUrl = "NGUYEN%20ANH%20DUC";
        return String.format("https://img.vietqr.io/image/970415-2516032004-compact2.png?amount=%d&addInfo=%s&accountName=%s",
                amountStr, transactionCode, accountNameUrl);
    }

    @PostMapping("/deposit/{classSessionId}")
    @Transactional
    public ResponseEntity<?> payDeposit(@PathVariable Long classSessionId) {
        ClassSession session = classSessionRepository.findById(classSessionId)
                .orElseThrow(() -> new RuntimeException("ClassSession not found"));

        if (session.getStatus() != ClassSessionStatus.PENDING_PAYMENT) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lớp học không ở trạng thái chờ đóng cọc."));
        }

        double totalPrice = calculateTotalPrice(session);
        if (session.getPrice() == null) {
            session.setPrice(totalPrice);
            classSessionRepository.save(session);
        }

        Transaction tx = transactionRepository.findByClassSessionIdAndStatus(classSessionId, TransactionStatus.PENDING)
                .orElse(new Transaction());
        
        if (tx.getId() == null) {
            tx.setClassSession(session);
            tx.setType(TransactionType.DEPOSIT);
            tx.setStatus(TransactionStatus.PENDING);
            tx.setTransactionCode("SHDEP" + classSessionId + (System.currentTimeMillis() % 10000));
            tx.setAmount(totalPrice * 0.25);
            transactionRepository.save(tx);
        }

        String qrUrl = generateVietQR(tx.getAmount(), tx.getTransactionCode());
        return ResponseEntity.ok(Map.of("qrUrl", qrUrl, "transactionCode", tx.getTransactionCode(), "amount", tx.getAmount()));
    }

    @PostMapping("/final/{classSessionId}")
    @Transactional
    public ResponseEntity<?> payFinal(@PathVariable Long classSessionId) {
        ClassSession session = classSessionRepository.findById(classSessionId)
                .orElseThrow(() -> new RuntimeException("ClassSession not found"));

        if (session.getStatus() != ClassSessionStatus.PENDING_FINAL_PAYMENT) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lớp học chưa xác nhận hoàn thành để thanh toán nốt."));
        }

        double totalPrice = calculateTotalPrice(session);

        Transaction tx = transactionRepository.findByClassSessionIdAndStatus(classSessionId, TransactionStatus.PENDING)
                .orElse(new Transaction());
        
        if (tx.getId() == null) {
            tx.setClassSession(session);
            tx.setType(TransactionType.FINAL_PAYMENT);
            tx.setStatus(TransactionStatus.PENDING);
            tx.setTransactionCode("SHFIN" + classSessionId + (System.currentTimeMillis() % 10000));
            tx.setAmount(totalPrice * 0.75);
            transactionRepository.save(tx);
        }

        String qrUrl = generateVietQR(tx.getAmount(), tx.getTransactionCode());
        return ResponseEntity.ok(Map.of("qrUrl", qrUrl, "transactionCode", tx.getTransactionCode(), "amount", tx.getAmount()));
    }
}
