package com.management.studyhub.service;

import com.management.studyhub.entity.ClassSession;
import com.management.studyhub.entity.Transaction;
import com.management.studyhub.entity.enums.ClassSessionStatus;
import com.management.studyhub.entity.enums.TransactionStatus;
import com.management.studyhub.entity.enums.TransactionType;
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
    private static final String BANK_BIN = "970415"; // Techcombank
    private static final String ACCOUNT_NUMBER = "2516032004";
    private static final String ACCOUNT_NAME = "NGUYEN ANH DUC";

    @Transactional
    public Map<String, String> generatePaymentQR(Long classId) {
        ClassSession classSession = classSessionRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        ClassSessionStatus status = classSession.getStatus();
        if (status != ClassSessionStatus.TRIAL && status != ClassSessionStatus.PENDING_PAYMENT) {
            throw new RuntimeException("Class is not in TRIAL or PENDING_PAYMENT status");
        }

        // Tìm transaction PENDING cũ
        Transaction transaction = transactionRepository.findFirstByClassSessionIdAndStatusOrderByIdDesc(classId, TransactionStatus.PENDING)
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
        String accountNameUrl = ACCOUNT_NAME.replace(" ", "%20");
        String qrUrl = String.format("https://img.vietqr.io/image/%s-%s-compact2.png?amount=%d&addInfo=%s&accountName=%s",
                BANK_BIN, ACCOUNT_NUMBER, amountStr, transactionCode, accountNameUrl);
        
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
        if (transaction.getType() == TransactionType.FINAL_PAYMENT) {
            classSession.setStatus(ClassSessionStatus.PAID_IN_FULL);
        } else if (transaction.getType() == TransactionType.EXTRA_PAYMENT) {
            classSession.setStatus(ClassSessionStatus.COMPLETED);
        } else {
            classSession.setStatus(ClassSessionStatus.CONFIRMED);
        }
        classSessionRepository.save(classSession);

        // Tạo CommissionRecord (Hoa hồng 25%)
        com.management.studyhub.entity.CommissionRecord commission = new com.management.studyhub.entity.CommissionRecord();
        commission.setTransaction(transaction);
        commission.setTotalAmount(transaction.getAmount());
        double platformFee = transaction.getAmount() * 0.25;
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
                                    if (t.getType() == TransactionType.FINAL_PAYMENT) {
                                        classSession.setStatus(ClassSessionStatus.PAID_IN_FULL);
                                    } else if (t.getType() == TransactionType.EXTRA_PAYMENT) {
                                        classSession.setStatus(ClassSessionStatus.COMPLETED);
                                    } else {
                                        classSession.setStatus(ClassSessionStatus.CONFIRMED);
                                    }
                                    classSessionRepository.save(classSession);
                                    
                                    // Tạo CommissionRecord (Hoa hồng 25%)
                                    com.management.studyhub.entity.CommissionRecord commission = new com.management.studyhub.entity.CommissionRecord();
                                    commission.setTransaction(t);
                                    commission.setTotalAmount(t.getAmount());
                                    double platformFee = t.getAmount() * 0.25;
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

        // Tích lũy số tiền thực tế phụ huynh đã đóng (trừ đi hoàn tiền)
        double totalPaid = 0.0;
        List<Transaction> transactions = transactionRepository.findByClassSessionId(classId);
        for (Transaction t : transactions) {
            if (t.getStatus() == TransactionStatus.SUCCESS) {
                if (t.getType() == TransactionType.DEPOSIT || 
                    t.getType() == TransactionType.FINAL_PAYMENT || 
                    t.getType() == TransactionType.EXTRA_PAYMENT) {
                    totalPaid += t.getAmount();
                } else if (t.getType() == TransactionType.REFUND) {
                    totalPaid -= t.getAmount();
                }
            }
        }

        // Tính số tiền thực nhận của Gia sư (75%)
        double payoutAmount = totalPaid * 0.75;

        classSession.setStatus(ClassSessionStatus.DISBURSED);
        classSessionRepository.save(classSession);
        
        Transaction payout = new Transaction();
        payout.setTransactionCode("PAYOUT-" + System.currentTimeMillis());
        payout.setClassSession(classSession);
        payout.setAmount(payoutAmount);
        payout.setStatus(TransactionStatus.SUCCESS);
        payout.setType(TransactionType.PAYOUT);
        payout.setCreatedAt(java.time.LocalDateTime.now());
        transactionRepository.save(payout);

        log.info("Disbursed payment for class: {}", classId);
    }

    public List<Map<String, Object>> getTransactionsByParent(Long userId) {
        return transactionRepository.findByClassSession_Parent_User_Id(userId).stream()
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
            "type", t.getType() != null ? t.getType().name() : "",
            "createdAt", t.getCreatedAt() != null ? t.getCreatedAt().toString() : "",
            "className", t.getClassSession() != null && t.getClassSession().getClassName() != null ? t.getClassSession().getClassName() : "",
            "parentName", t.getClassSession() != null && t.getClassSession().getParentName() != null ? t.getClassSession().getParentName() : "",
            "tutorName", t.getClassSession() != null && t.getClassSession().getTutorName() != null ? t.getClassSession().getTutorName() : "",
            "classId", t.getClassSession() != null ? t.getClassSession().getId() : 0
        );
    }
}
