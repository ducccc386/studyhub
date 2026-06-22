package com.management.studyhub.repository;

import com.management.studyhub.entity.CommissionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CommissionRecordRepository extends JpaRepository<CommissionRecord, Long> {

    @Query("SELECT SUM(c.platformFee) FROM CommissionRecord c")
    Double getTotalPlatformFee();
}
