package com.management.studyhub.repository;

import com.management.studyhub.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByTransactionCode(String transactionCode);
    Optional<Transaction> findFirstByClassSessionIdAndStatusOrderByIdDesc(Long classSessionId, com.management.studyhub.entity.enums.TransactionStatus status);
    Optional<Transaction> findFirstByClassSessionIdAndStatusAndTypeOrderByIdDesc(Long classSessionId, com.management.studyhub.entity.enums.TransactionStatus status, com.management.studyhub.entity.enums.TransactionType type);
    java.util.List<Transaction> findByClassSession_Parent_User_Id(Long userId);
}
