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

    private int parseSessionsPerWeek(String schedule) {
        if (schedule == null || schedule.isEmpty()) {
            return 2;
        }
        String s = schedule.toLowerCase();
        int count = 0;
        if (s.contains("hai") || s.contains("2")) count++;
        if (s.contains("ba") || s.contains("3")) count++;
        if (s.contains("tư") || s.contains("bốn") || s.contains("4")) count++;
        if (s.contains("năm") || s.contains("5")) count++;
        if (s.contains("sáu") || s.contains("6")) count++;
        if (s.contains("bảy") || s.contains("7")) count++;
        if (s.contains("chủ nhật") || s.contains("cn") || s.contains("sunday") || s.contains("chủnhật")) count++;
        return count > 0 ? count : 2;
    }

    private double calculateTotalPrice(ClassSession session) {
        double pricePer = session.getPricePerSession() != null ? session.getPricePerSession() : 0;
        int sessionsPerWeek = parseSessionsPerWeek(session.getSchedule());
        int monthlySessions = sessionsPerWeek * 4;
        return pricePer * monthlySessions;
    }

    private String generateVietQR(double amount, String transactionCode) {
        long amountStr = (long) amount;
        String accountNameUrl = "TRAN%20THI%20LUYEN";
        return String.format("https://img.vietqr.io/image/970423-00000800387-compact2.png?amount=%d&addInfo=%s&accountName=%s",
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
        session.setPrice(totalPrice);
        classSessionRepository.save(session);

        Transaction tx = transactionRepository.findFirstByClassSessionIdAndStatusAndTypeOrderByIdDesc(classSessionId, TransactionStatus.PENDING, TransactionType.DEPOSIT)
                .orElse(new Transaction());
        
        if (tx.getId() == null) {
            tx.setClassSession(session);
            tx.setType(TransactionType.DEPOSIT);
            tx.setStatus(TransactionStatus.PENDING);
            tx.setTransactionCode("SHDEP" + classSessionId + (System.currentTimeMillis() % 10000));
            tx.setAmount(totalPrice);
            transactionRepository.save(tx);
        } else {
            tx.setAmount(totalPrice);
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

    @org.springframework.web.bind.annotation.GetMapping("/settle-preview/{classSessionId}")
    public ResponseEntity<?> getSettlePreview(@PathVariable Long classSessionId) {
        ClassSession session = classSessionRepository.findById(classSessionId)
                .orElseThrow(() -> new RuntimeException("ClassSession not found"));

        long approvedLessons = lessonLogRepository.countByClassSessionIdAndParentApprovalStatus(classSessionId, ParentApprovalStatus.APPROVED);
        double pricePerSession = session.getPricePerSession() != null ? session.getPricePerSession() : 0;
        double actualCost = approvedLessons * pricePerSession;
        double paidAmount = session.getPrice() != null ? session.getPrice() : 0;
        double diff = actualCost - paidAmount;

        return ResponseEntity.ok(Map.of(
            "classId", classSessionId,
            "className", session.getClassName() != null ? session.getClassName() : "",
            "tutorName", session.getTutorName() != null ? session.getTutorName() : "",
            "parentName", session.getParentName() != null ? session.getParentName() : "",
            "approvedLessons", approvedLessons,
            "pricePerSession", pricePerSession,
            "actualCost", actualCost,
            "paidAmount", paidAmount,
            "diff", diff,
            "status", diff > 0 ? "EXTRA" : diff < 0 ? "REFUND" : "EXACT"
        ));
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
