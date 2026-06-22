package com.management.studyhub.repository;

import com.management.studyhub.entity.LessonLog;
import com.management.studyhub.entity.enums.ParentApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LessonLogRepository extends JpaRepository<LessonLog, Long> {
    List<LessonLog> findByClassSessionIdOrderByScheduledDateDesc(Long classSessionId);

    // Tìm tất cả lesson logs PENDING theo userId của parent
    @Query("SELECT l FROM LessonLog l WHERE l.classSession.parent.user.id = :userId AND l.parentApprovalStatus = :status ORDER BY l.scheduledDate DESC")
    List<LessonLog> findByParentUserIdAndApprovalStatus(Long userId, ParentApprovalStatus status);

    // Tìm tất cả lesson logs đã xác nhận (APPROVED hoặc DISPUTED) theo userId của parent
    @Query("SELECT l FROM LessonLog l WHERE l.classSession.parent.user.id = :userId AND l.parentApprovalStatus <> com.management.studyhub.entity.enums.ParentApprovalStatus.PENDING ORDER BY l.scheduledDate DESC")
    List<LessonLog> findReviewedByParentUserId(Long userId);

    @Query("SELECT AVG(l.parentRating) FROM LessonLog l WHERE l.parentRating IS NOT NULL")
    Double getOverallAverageRating();

    @Query("SELECT COUNT(l) FROM LessonLog l WHERE l.classSession.tutorProfileId = :tutorId AND l.parentApprovalStatus = :status")
    long countByTutorProfileIdAndParentApprovalStatus(@org.springframework.data.repository.query.Param("tutorId") Long tutorId, @org.springframework.data.repository.query.Param("status") ParentApprovalStatus status);
}
