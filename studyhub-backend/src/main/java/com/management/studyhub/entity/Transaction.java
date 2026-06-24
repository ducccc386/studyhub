package com.management.studyhub.entity;

import com.management.studyhub.entity.enums.TransactionStatus;
import com.management.studyhub.entity.enums.TransactionType;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_session_id")
    private ClassSession classSession;

    private String transactionCode;
    
    private Double amount;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TransactionStatus status;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TransactionType type;
    
    private LocalDateTime createdAt;
    
    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
