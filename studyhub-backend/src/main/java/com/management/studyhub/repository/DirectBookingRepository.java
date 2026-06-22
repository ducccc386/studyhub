package com.management.studyhub.repository;

import com.management.studyhub.entity.DirectBooking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DirectBookingRepository extends JpaRepository<DirectBooking, Long> {
    List<DirectBooking> findByParentIdOrderByCreatedAtDesc(Long parentId);
    List<DirectBooking> findByTutorIdOrderByCreatedAtDesc(Long tutorId);
}
