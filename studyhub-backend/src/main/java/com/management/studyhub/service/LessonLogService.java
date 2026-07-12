package com.management.studyhub.service;

import com.management.studyhub.dto.LessonLogDTO;
import com.management.studyhub.dto.ParentConfirmDTO;
import com.management.studyhub.entity.ClassSession;
import com.management.studyhub.entity.LessonLog;
import com.management.studyhub.entity.enums.LessonStatus;
import com.management.studyhub.entity.enums.ParentApprovalStatus;
import com.management.studyhub.repository.ClassSessionRepository;
import com.management.studyhub.repository.LessonLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.management.studyhub.repository.TutorProfileRepository;
import com.management.studyhub.entity.TutorProfile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonLogService {

    private final LessonLogRepository lessonLogRepository;
    private final ClassSessionRepository classSessionRepository;
    private final TutorProfileRepository tutorProfileRepository;

    public List<LessonLogDTO> getLessonLogsByClassSessionId(Long classSessionId) {
        return lessonLogRepository.findByClassSessionIdOrderByScheduledDateDesc(classSessionId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<LessonLogDTO> getPendingLogsForParent(Long userId) {
        return lessonLogRepository.findByParentUserIdAndApprovalStatus(userId, ParentApprovalStatus.PENDING)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<LessonLogDTO> getReviewedLogsForParent(Long userId) {
        return lessonLogRepository.findReviewedByParentUserId(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public LessonLogDTO createLessonLog(Long classSessionId, LessonLogDTO dto) {
        ClassSession session = classSessionRepository.findById(classSessionId)
                .orElseThrow(() -> new RuntimeException("ClassSession not found"));

        int currentProgress = session.getProgress() != null ? session.getProgress() : 0;
        if (com.management.studyhub.entity.enums.ClassSessionStatus.TRIAL.equals(session.getStatus()) && currentProgress >= 2) {
            throw new RuntimeException("Lớp học thử đã đạt giới hạn 2 buổi học. Vui lòng yêu cầu Phụ huynh 'Xác nhận thuê' và hoàn tất thanh toán để tiếp tục.");
        }

        LessonLog log = new LessonLog();
        log.setClassSession(session);
        log.setTitle(dto.getTitle());
        log.setContent(dto.getContent());
        log.setTutorFeedback(dto.getTutorFeedback());
        log.setScheduledDate(dto.getScheduledDate());
        log.setStatus(dto.getStatus() != null ? LessonStatus.valueOf(dto.getStatus()) : LessonStatus.PRESENT);

        LessonLog saved = lessonLogRepository.save(log);

        // Update class progress implicitly
        session.setProgress(currentProgress + 1);
        classSessionRepository.save(session);

        return mapToDTO(saved);
    }

    @Transactional
    public LessonLogDTO parentConfirmLesson(Long logId, com.management.studyhub.dto.ParentConfirmDTO dto) {
        LessonLog log = lessonLogRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("LessonLog not found"));
        
        log.setParentApprovalStatus(dto.getStatus() != null 
            ? com.management.studyhub.entity.enums.ParentApprovalStatus.valueOf(dto.getStatus()) 
            : com.management.studyhub.entity.enums.ParentApprovalStatus.PENDING);
        log.setParentRating(dto.getRating());
        log.setParentFeedback(dto.getFeedback());
        log.setParentFeedbackTags(dto.getTags());
        
        LessonLog savedLog = lessonLogRepository.save(log);

        // Update TutorProfile average rating
        if (log.getClassSession() != null && log.getClassSession().getTutorProfileId() != null) {
            Long tutorId = log.getClassSession().getTutorProfileId();
            TutorProfile tutorProfile = tutorProfileRepository.findById(tutorId).orElse(null);
            if (tutorProfile != null) {
                Double avgRating = lessonLogRepository.getAverageRatingByTutorProfileId(tutorId);
                Integer totalReviews = lessonLogRepository.countReviewsByTutorProfileId(tutorId);
                
                tutorProfile.setAverageRating(avgRating != null ? avgRating : 0.0);
                tutorProfile.setTotalReviews(totalReviews != null ? totalReviews : 0);
                tutorProfileRepository.save(tutorProfile);
            }
        }
        
        return mapToDTO(savedLog);
    }

    private LessonLogDTO mapToDTO(LessonLog log) {
        LessonLogDTO dto = new LessonLogDTO();
        dto.setId(log.getId());
        if (log.getClassSession() != null) {
            dto.setClassSessionId(log.getClassSession().getId());
            dto.setClassName(log.getClassSession().getClassName());
            dto.setTutorName(log.getClassSession().getTutorName());
            dto.setTutorAvatar(log.getClassSession().getTutorAvatar());
        }
        dto.setTitle(log.getTitle());
        dto.setContent(log.getContent());
        dto.setTutorFeedback(log.getTutorFeedback());
        dto.setScheduledDate(log.getScheduledDate());
        dto.setStatus(log.getStatus() != null ? log.getStatus().name() : null);
        dto.setParentApprovalStatus(log.getParentApprovalStatus() != null ? log.getParentApprovalStatus().name() : null);
        dto.setParentRating(log.getParentRating());
        dto.setParentFeedback(log.getParentFeedback());
        dto.setParentFeedbackTags(log.getParentFeedbackTags());
        return dto;
    }
}
