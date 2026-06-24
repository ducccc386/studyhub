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
        }

        Transaction tx = new Transaction();
        tx.setClassSession(session);
        tx.setType(TransactionType.DEPOSIT);
        tx.setStatus(TransactionStatus.SUCCESS);
        tx.setTransactionCode("MOCK_DEP_" + UUID.randomUUID().toString().substring(0, 8));
        tx.setAmount(totalPrice * 0.25);
        transactionRepository.save(tx);

        // Tạo CommissionRecord cho đợt cọc
        CommissionRecord commission = new CommissionRecord();
        commission.setTransaction(tx);
        commission.setTotalAmount(tx.getAmount());
        commission.setPlatformFee(tx.getAmount() * 0.20); // Ghi nhận 20% doanh thu trên số tiền cọc
        commission.setTutorPayout(tx.getAmount() * 0.80); // Phần còn lại sẽ được cộng dồn để trả cho gia sư sau
        commissionRecordRepository.save(commission);

        session.setStatus(ClassSessionStatus.CONFIRMED);
        classSessionRepository.save(session);

        return ResponseEntity.ok(Map.of("message", "Thanh toán cọc 25% thành công", "transaction", tx));
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

        Transaction tx = new Transaction();
        tx.setClassSession(session);
        tx.setType(TransactionType.FINAL_PAYMENT);
        tx.setStatus(TransactionStatus.SUCCESS);
        tx.setTransactionCode("MOCK_FIN_" + UUID.randomUUID().toString().substring(0, 8));
        tx.setAmount(totalPrice * 0.75);
        transactionRepository.save(tx);

        // Tạo CommissionRecord cho đợt thanh toán nốt
        CommissionRecord commission = new CommissionRecord();
        commission.setTransaction(tx);
        commission.setTotalAmount(tx.getAmount());
        commission.setPlatformFee(tx.getAmount() * 0.20); // Ghi nhận 20% doanh thu trên số tiền thanh toán nốt
        commission.setTutorPayout(tx.getAmount() * 0.80);
        commissionRecordRepository.save(commission);

        // Chuyển sang trạng thái COMPLETED để chờ Admin xác nhận giải ngân
        session.setStatus(ClassSessionStatus.COMPLETED);
        classSessionRepository.save(session);

        return ResponseEntity.ok(Map.of("message", "Thanh toán nốt 75% thành công", "transaction", tx));
    }
}
