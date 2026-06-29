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
import com.management.studyhub.repository.LessonLogRepository;
import com.management.studyhub.entity.enums.ParentApprovalStatus;
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
    private final LessonLogRepository lessonLogRepository;

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

        Transaction tx = transactionRepository.findFirstByClassSessionIdAndStatusAndTypeOrderByIdDesc(classSessionId, TransactionStatus.PENDING, TransactionType.DEPOSIT)
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

        Transaction tx = transactionRepository.findFirstByClassSessionIdAndStatusAndTypeOrderByIdDesc(classSessionId, TransactionStatus.PENDING, TransactionType.FINAL_PAYMENT)
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

    @PostMapping("/extra/{classSessionId}")
    @Transactional
    public ResponseEntity<?> payExtra(@PathVariable Long classSessionId) {
        ClassSession session = classSessionRepository.findById(classSessionId)
                .orElseThrow(() -> new RuntimeException("ClassSession not found"));

        if (session.getStatus() != ClassSessionStatus.PENDING_SETTLEMENT) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lớp học không có khoản thu thêm."));
        }

        Transaction tx = transactionRepository.findFirstByClassSessionIdAndStatusAndTypeOrderByIdDesc(classSessionId, TransactionStatus.PENDING, TransactionType.EXTRA_PAYMENT)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch thu thêm"));

        String qrUrl = generateVietQR(tx.getAmount(), tx.getTransactionCode());
        return ResponseEntity.ok(Map.of("qrUrl", qrUrl, "transactionCode", tx.getTransactionCode(), "amount", tx.getAmount()));
    }

    @PostMapping("/settle/{classSessionId}")
    @Transactional
    public ResponseEntity<?> settleClassSession(@PathVariable Long classSessionId) {
        ClassSession session = classSessionRepository.findById(classSessionId)
                .orElseThrow(() -> new RuntimeException("ClassSession not found"));

        if (session.getStatus() != ClassSessionStatus.PAID_IN_FULL && session.getStatus() != ClassSessionStatus.PENDING_SETTLEMENT) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lớp học chưa đủ điều kiện quyết toán."));
        }

        // Đếm số buổi đã học được phụ huynh xác nhận
        long approvedLessons = lessonLogRepository.countByClassSessionIdAndParentApprovalStatus(classSessionId, ParentApprovalStatus.APPROVED);
        double actualCost = approvedLessons * (session.getPricePerSession() != null ? session.getPricePerSession() : 0);
        double paidAmount = session.getPrice() != null ? session.getPrice() : 0;

        if (actualCost == paidAmount) {
            session.setStatus(ClassSessionStatus.COMPLETED);
            classSessionRepository.save(session);
            return ResponseEntity.ok(Map.of("message", "Quyết toán vừa đủ. Lớp học hoàn thành."));
        }

        if (actualCost < paidAmount) {
            // Cần hoàn tiền
            double refundAmount = paidAmount - actualCost;
            Transaction refundTx = new Transaction();
            refundTx.setClassSession(session);
            refundTx.setType(TransactionType.REFUND);
            refundTx.setStatus(TransactionStatus.SUCCESS);
            refundTx.setTransactionCode("SHREF" + classSessionId + (System.currentTimeMillis() % 10000));
            refundTx.setAmount(refundAmount);
            transactionRepository.save(refundTx);

            // Hoàn lại hoa hồng tương ứng
            CommissionRecord commission = new CommissionRecord();
            commission.setTransaction(refundTx);
            commission.setTotalAmount(-refundAmount);
            double platformFee = -refundAmount * 0.25;
            commission.setPlatformFee(platformFee);
            commission.setTutorPayout(-refundAmount - platformFee);
            commissionRecordRepository.save(commission);

            session.setStatus(ClassSessionStatus.COMPLETED);
            classSessionRepository.save(session);
            return ResponseEntity.ok(Map.of("message", "Quyết toán hoàn tiền thành công. Số tiền hoàn: " + refundAmount));
        } else {
            // Cần thu thêm
            double extraAmount = actualCost - paidAmount;
            Transaction extraTx = transactionRepository.findFirstByClassSessionIdAndStatusAndTypeOrderByIdDesc(classSessionId, TransactionStatus.PENDING, TransactionType.EXTRA_PAYMENT)
                    .orElse(new Transaction());
            
            if (extraTx.getId() == null) {
                extraTx.setClassSession(session);
                extraTx.setType(TransactionType.EXTRA_PAYMENT);
                extraTx.setStatus(TransactionStatus.PENDING);
                extraTx.setTransactionCode("SHEXT" + classSessionId + (System.currentTimeMillis() % 10000));
                extraTx.setAmount(extraAmount);
                transactionRepository.save(extraTx);
            }

            session.setStatus(ClassSessionStatus.PENDING_SETTLEMENT);
            classSessionRepository.save(session);

            String qrUrl = generateVietQR(extraTx.getAmount(), extraTx.getTransactionCode());
            return ResponseEntity.ok(Map.of("qrUrl", qrUrl, "transactionCode", extraTx.getTransactionCode(), "amount", extraTx.getAmount()));
        }
    }
}
