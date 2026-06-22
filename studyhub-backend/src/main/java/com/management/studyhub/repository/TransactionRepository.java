package com.management.studyhub.repository;

import com.management.studyhub.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByTransactionCode(String transactionCode);
    Optional<Transaction> findByClassSessionIdAndStatus(Long classSessionId, com.management.studyhub.entity.enums.TransactionStatus status);
}
