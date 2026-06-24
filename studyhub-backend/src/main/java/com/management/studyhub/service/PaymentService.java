package com.management.studyhub.service;

import com.management.studyhub.entity.ClassSession;
import com.management.studyhub.entity.Transaction;
import com.management.studyhub.entity.enums.ClassSessionStatus;
import com.management.studyhub.entity.enums.TransactionStatus;
import com.management.studyhub.repository.ClassSessionRepository;
import com.management.studyhub.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final ClassSessionRepository classSessionRepository;
    private final TransactionRepository transactionRepository;
    private final com.management.studyhub.repository.CommissionRecordRepository commissionRecordRepository;

    // Thay bằng số tài khoản thật của StudyHub
    private static final String BANK_BIN = "MB"; // MB Bank
    private static final String ACCOUNT_NUMBER = "9704229206661626271";
    private static final String ACCOUNT_NAME = "Giang Hong Son";

    @Transactional
    public Map<String, String> generatePaymentQR(Long classId) {
        ClassSession classSession = classSessionRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        ClassSessionStatus status = classSession.getStatus();
        if (status != ClassSessionStatus.TRIAL && status != ClassSessionStatus.PENDING_PAYMENT) {
            throw new RuntimeException("Class is not in TRIAL or PENDING_PAYMENT status");
        }

        // Tìm transaction PENDING cũ
        Transaction transaction = transactionRepository.findByClassSessionIdAndStatus(classId, TransactionStatus.PENDING)
                .orElse(null);

        String transactionCode;
        if (transaction != null) {
            transactionCode = transaction.getTransactionCode();
        } else {
            // Tạo Transaction mới
            transactionCode = "SH" + classId + (System.currentTimeMillis() % 10000);
            transaction = new Transaction();
            transaction.setClassSession(classSession);
            transaction.setTransactionCode(transactionCode);
            
            Double amount = classSession.getPrice();
            if (amount == null || amount <= 0) {
                // Fallback nếu price null: tính theo số buổi (ví dụ mặc định chốt 8 buổi học thử xong)
                Double pricePerSession = classSession.getPricePerSession() != null ? classSession.getPricePerSession() : 0.0;
                amount = pricePerSession * 8.0; 
            }
            transaction.setAmount(amount);
            transaction.setStatus(TransactionStatus.PENDING);
            transactionRepository.save(transaction);
        }

        // Update Class status
        if (status == ClassSessionStatus.TRIAL) {
            classSession.setStatus(ClassSessionStatus.PENDING_PAYMENT);
            classSessionRepository.save(classSession);
        }

        // Tạo VietQR link
        long amountStr = transaction.getAmount() != null ? transaction.getAmount().longValue() : 0L;
        String qrUrl = String.format("https://img.vietqr.io/image/%s-%s-compact2.png?amount=%d&addInfo=%s&accountName=%s",
                BANK_BIN, ACCOUNT_NUMBER, amountStr, transactionCode, ACCOUNT_NAME);
        
        return Map.of(
            "qrUrl", qrUrl,
            "transactionCode", transactionCode
        );
    }

    @Transactional
    public void mockPay(String transactionCode) {
        Transaction transaction = transactionRepository.findByTransactionCode(transactionCode)
                .orElseThrow(() -> new RuntimeException("Transaction not found: " + transactionCode));

        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new RuntimeException("Transaction is already processed");
        }

        transaction.setStatus(TransactionStatus.SUCCESS);
        transactionRepository.save(transaction);

        ClassSession classSession = transaction.getClassSession();
        classSession.setStatus(ClassSessionStatus.CONFIRMED);
        classSessionRepository.save(classSession);

        // Tạo CommissionRecord (Hoa hồng 20%)
        com.management.studyhub.entity.CommissionRecord commission = new com.management.studyhub.entity.CommissionRecord();
        commission.setTransaction(transaction);
        commission.setTotalAmount(transaction.getAmount());
        double platformFee = transaction.getAmount() * 0.20;
        commission.setPlatformFee(platformFee);
        commission.setTutorPayout(transaction.getAmount() - platformFee);
        commissionRecordRepository.save(commission);

        log.info("Mock payment confirmed for transaction: {}", transactionCode);
    }

    public TransactionStatus getTransactionStatus(String transactionCode) {
        Transaction transaction = transactionRepository.findByTransactionCode(transactionCode)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        return transaction.getStatus();
    }

    @Transactional
    public void handleWebhook(Map<String, Object> payload) {
        // Giả lập xử lý webhook từ Casso / PayOS
        // Thường webhook sẽ có dạng { "data": [ { "description": "CK SH12345", "amount": 2000000 } ] }
        log.info("Received Webhook: {}", payload);
        
        try {
            // Giả lập parse data cơ bản
            if (payload.containsKey("data")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> dataList = (List<Map<String, Object>>) payload.get("data");
                for (Map<String, Object> data : dataList) {
                    String description = (String) data.get("description");
                    Number amount = (Number) data.get("amount");
                    
                    if (description != null) {
                        // Tìm transaction code trong description (Mô phỏng bằng Regex)
                        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(SH\\d{1,10})");
                        java.util.regex.Matcher matcher = pattern.matcher(description);
                        if (matcher.find()) {
                            String code = matcher.group(1);
                            transactionRepository.findByTransactionCode(code).ifPresent(t -> {
                                if (t.getStatus() == TransactionStatus.PENDING && Math.abs(t.getAmount() - amount.doubleValue()) < 1.0) {
                                    t.setStatus(TransactionStatus.SUCCESS);
                                    transactionRepository.save(t);
                                    
                                    ClassSession classSession = t.getClassSession();
                                    classSession.setStatus(ClassSessionStatus.CONFIRMED);
                                    classSessionRepository.save(classSession);
                                    
                                    // Tạo CommissionRecord (Hoa hồng 20%)
                                    com.management.studyhub.entity.CommissionRecord commission = new com.management.studyhub.entity.CommissionRecord();
                                    commission.setTransaction(t);
                                    commission.setTotalAmount(t.getAmount());
                                    double platformFee = t.getAmount() * 0.20;
                                    commission.setPlatformFee(platformFee);
                                    commission.setTutorPayout(t.getAmount() - platformFee);
                                    commissionRecordRepository.save(commission);
                                    
                                    log.info("Payment confirmed & Commission generated for transaction: {}", t.getTransactionCode());
                                }
                            });
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error processing webhook", e);
        }
    }

    public List<ClassSession> getCompletedClasses() {
        return classSessionRepository.findByStatus(ClassSessionStatus.COMPLETED);
    }

    @Transactional
    public void disburseClass(Long classId) {
        ClassSession classSession = classSessionRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        if (classSession.getStatus() != ClassSessionStatus.COMPLETED) {
            throw new RuntimeException("Class must be COMPLETED to disburse");
        }

        classSession.setStatus(ClassSessionStatus.DISBURSED);
        classSessionRepository.save(classSession);
        log.info("Disbursed payment for class: {}", classId);
    }

    public List<Map<String, Object>> getTransactionsByParent(Long parentId) {
        return transactionRepository.findByClassSession_Parent_Id(parentId).stream()
            .map(this::mapTransactionToDto)
            .toList();
    }

    public List<Map<String, Object>> getAllTransactions() {
        return transactionRepository.findAll().stream()
            .map(this::mapTransactionToDto)
            .toList();
    }

    private Map<String, Object> mapTransactionToDto(Transaction t) {
        return Map.of(
            "id", t.getId(),
            "transactionCode", t.getTransactionCode() != null ? t.getTransactionCode() : "",
            "amount", t.getAmount() != null ? t.getAmount() : 0.0,
            "status", t.getStatus() != null ? t.getStatus().name() : "",
            "createdAt", t.getCreatedAt() != null ? t.getCreatedAt().toString() : "",
            "className", t.getClassSession() != null && t.getClassSession().getClassName() != null ? t.getClassSession().getClassName() : "",
            "parentName", t.getClassSession() != null && t.getClassSession().getParentName() != null ? t.getClassSession().getParentName() : "",
            "classId", t.getClassSession() != null ? t.getClassSession().getId() : 0
        );
    }
}
