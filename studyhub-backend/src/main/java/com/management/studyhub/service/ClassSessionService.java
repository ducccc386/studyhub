package com.management.studyhub.service;

import com.management.studyhub.dto.ClassSessionDTO;
import com.management.studyhub.dto.ClassSyllabusDTO;
import com.management.studyhub.dto.SyllabusSessionDTO;
import com.management.studyhub.entity.Applicant;
import com.management.studyhub.entity.ClassSession;
import com.management.studyhub.entity.JobPosting;
import com.management.studyhub.entity.Parent;
import com.management.studyhub.entity.SyllabusSession;
import com.management.studyhub.entity.User;
import com.management.studyhub.entity.enums.ClassSessionStatus;
import com.management.studyhub.repository.ApplicantRepository;
import com.management.studyhub.repository.ClassSessionRepository;
import com.management.studyhub.repository.JobPostingRepository;
import com.management.studyhub.repository.ParentRepository;
import com.management.studyhub.repository.SyllabusSessionRepository;
import com.management.studyhub.repository.TutorProfileRepository;
import com.management.studyhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassSessionService {

    private final ClassSessionRepository classSessionRepository;
    private final ApplicantRepository applicantRepository;
    private final JobPostingRepository jobPostingRepository;
    private final ParentRepository parentRepository;
    private final SyllabusSessionRepository syllabusSessionRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final UserRepository userRepository;

    private Parent getOrCreateParent(Long userId) {
        return parentRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
            Parent newParent = new Parent();
            newParent.setUser(user);
            newParent.setName(user.getFullName());
            newParent.setEmail(user.getEmail());
            newParent.setAvatar(user.getAvatarUrl());
            newParent.setBudgetSpentThisMonth(0.0);
            newParent.setClassesWaiting(0);
            return parentRepository.save(newParent);
        });
    }

    /**
     * Phụ huynh chấp nhận 1 ứng viên:
     *  1. Applicant → ACCEPTED
     *  2. Các Applicant khác cùng post → REJECTED
     *  3. JobPosting → CLOSED
     *  4. Tạo ClassSession mới (status = TRIAL)
     */
    @Transactional
    public ClassSessionDTO acceptApplicant(Long applicantId) {
        // 1. Lấy applicant được chọn
        Applicant accepted = applicantRepository.findById(applicantId)
                .orElseThrow(() -> new RuntimeException("Applicant not found: " + applicantId));

        JobPosting post = accepted.getJobPosting();
        if (post == null) throw new RuntimeException("JobPosting not found for applicant");

        // 2. Từ chối tất cả applicant khác cùng bài đăng
        List<Applicant> allApplicants = applicantRepository.findByJobPostingId(post.getId());
        for (Applicant a : allApplicants) {
            if (a.getId().equals(applicantId)) {
                a.setStatus("ACCEPTED");
            } else if ("PENDING".equals(a.getStatus())) {
                a.setStatus("REJECTED");
            }
        }
        applicantRepository.saveAll(allApplicants);

        // 3. Đóng bài đăng
        post.setStatus("CLOSED");
        jobPostingRepository.save(post);

        // 4. Tạo ClassSession mới
        ClassSession session = new ClassSession();
        session.setPostId(post.getId());
        session.setAcceptedApplicantId(applicantId);
        session.setClassName(post.getTitle());
        session.setSubject(post.getSubject());
        session.setSchedule(post.getSchedule());
        session.setLearningMode(post.getLearningMode());
        session.setAddress(post.getDetailedAddress());
        session.setPricePerSession(post.getPricePerSession());
        session.setStatus(ClassSessionStatus.TRIAL);
        session.setProgress(0);
        session.setTutorName(accepted.getTutorName());
        session.setTutorAvatar(accepted.getTutorAvatar());

        // Gắn parent
        if (post.getParent() != null) {
            session.setParent(post.getParent());
            session.setParentName(
                post.getParent().getUser() != null
                    ? post.getParent().getUser().getFullName()
                    : post.getParent().getName()
            );
        }

        // Parse tutorProfileId từ string tutorId
        try {
            session.setTutorProfileId(Long.parseLong(accepted.getTutorId()));
        } catch (NumberFormatException ignored) { }

        ClassSession saved = classSessionRepository.save(session);
        return mapToDTO(saved);
    }

    /**
     * Lấy danh sách lớp học của phụ huynh
     */
    public List<ClassSessionDTO> getSessionsByParent(Long userId) {
        Parent parent = getOrCreateParent(userId);

        return classSessionRepository.findByParentId(parent.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ClassSessionDTO> getSessionsByTutor(Long tutorProfileId) {
        return classSessionRepository.findByTutorProfileId(tutorProfileId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Admin: lấy tất cả lớp học trong hệ thống
     */
    public List<ClassSessionDTO> getAllSessions() {
        return classSessionRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ClassSessionDTO getSessionById(Long id) {
        ClassSession session = classSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ClassSession not found"));
        return mapToDTO(session);
    }

    @Transactional
    public ClassSessionDTO updateMeetingLink(Long id, String link) {
        ClassSession session = classSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ClassSession not found"));
        session.setMeetingLink(link);
        return mapToDTO(classSessionRepository.save(session));
    }

    @Transactional
    public ClassSessionDTO updateAddress(Long id, String address) {
        ClassSession session = classSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ClassSession not found"));
        session.setAddress(address);
        return mapToDTO(classSessionRepository.save(session));
    }

    /**
     * Cập nhật trạng thái lớp học
     * Các trạng thái hợp lệ: CONFIRMED, COMPLETED, CANCELLED, DISBURSED
     */
    @Transactional
    public ClassSessionDTO updateStatus(Long sessionId, String newStatus) {
        ClassSession session = classSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("ClassSession not found: " + sessionId));
        try {
            session.setStatus(ClassSessionStatus.valueOf(newStatus.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + newStatus);
        }
        return mapToDTO(classSessionRepository.save(session));
    }

    @Transactional
    public ClassSessionDTO trialDecision(Long sessionId, boolean isAccepted) {
        ClassSession session = classSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("ClassSession not found: " + sessionId));
        if (session.getStatus() != ClassSessionStatus.TRIAL) {
            throw new RuntimeException("Chỉ được quyết định khi lớp học đang ở trạng thái học thử (TRIAL).");
        }
        if (isAccepted) {
            session.setStatus(ClassSessionStatus.PENDING_PAYMENT);
        } else {
            session.setStatus(ClassSessionStatus.CANCELLED);
        }
        return mapToDTO(classSessionRepository.save(session));
    }

    /**
     * Phụ huynh từ chối 1 ứng viên cụ thể
     */
    @Transactional
    public void rejectApplicant(Long applicantId) {
        Applicant applicant = applicantRepository.findById(applicantId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ứng viên"));
        applicant.setStatus("REJECTED");
        applicantRepository.save(applicant);
    }

    // ── Mapper ──────────────────────────────────────────────────────────────

    private ClassSessionDTO mapToDTO(ClassSession s) {
        ClassSessionDTO dto = new ClassSessionDTO();
        dto.setId(s.getId());
        dto.setPostId(s.getPostId());
        dto.setTutorProfileId(s.getTutorProfileId());
        dto.setTutorName(s.getTutorName());
        dto.setTutorAvatar(s.getTutorAvatar());
        dto.setClassName(s.getClassName());
        dto.setSubject(s.getSubject());
        dto.setSchedule(s.getSchedule());
        dto.setLearningMode(s.getLearningMode());
        dto.setAddress(s.getAddress());
        dto.setMeetingLink(s.getMeetingLink());
        dto.setStatus(s.getStatus() != null ? s.getStatus().name() : null);
        dto.setPricePerSession(s.getPricePerSession());
        dto.setProgress(s.getProgress());
        dto.setSyllabusType(s.getSyllabusType());
        dto.setSyllabusStatus(s.getSyllabusStatus());
        dto.setCreatedAt(s.getCreatedAt());
        dto.setNextSessionDate(s.getNextSessionDate());
        dto.setCancelReason(s.getCancelReason());
        dto.setCancelledBy(s.getCancelledBy());

        if (s.getParent() != null) {
            dto.setParentId(s.getParent().getId());
            dto.setParentName(s.getParentName());
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public ClassSyllabusDTO getSyllabus(Long classSessionId) {
        ClassSession session = classSessionRepository.findById(classSessionId)
                .orElseThrow(() -> new RuntimeException("Lớp học không tồn tại"));

        ClassSyllabusDTO dto = new ClassSyllabusDTO();
        dto.setSyllabusType(session.getSyllabusType() != null ? session.getSyllabusType() : "STANDARD");
        dto.setSyllabusStatus(session.getSyllabusStatus() != null ? session.getSyllabusStatus() : "APPROVED");

        List<SyllabusSession> sessions = syllabusSessionRepository.findByClassSessionIdOrderBySessionNumberAsc(classSessionId);
        dto.setSessions(sessions.stream().map(this::mapToSyllabusSessionDTO).collect(Collectors.toList()));
        return dto;
    }

    @Transactional
    public ClassSyllabusDTO updateSyllabus(Long classSessionId, ClassSyllabusDTO syllabusDTO) {
        ClassSession session = classSessionRepository.findById(classSessionId)
                .orElseThrow(() -> new RuntimeException("Lớp học không tồn tại"));

        session.setSyllabusType(syllabusDTO.getSyllabusType());
        session.setSyllabusStatus(syllabusDTO.getSyllabusStatus() != null ? syllabusDTO.getSyllabusStatus() : "DRAFT");
        classSessionRepository.save(session);

        // Delete old sessions if any
        syllabusSessionRepository.deleteByClassSessionId(classSessionId);

        if (syllabusDTO.getSessions() != null) {
            for (SyllabusSessionDTO sd : syllabusDTO.getSessions()) {
                SyllabusSession entity = new SyllabusSession();
                entity.setClassSession(session);
                entity.setSessionNumber(sd.getSessionNumber());
                entity.setTitle(sd.getTitle());
                entity.setContent(sd.getContent());
                entity.setKeyKnowledge(sd.getKeyKnowledge());
                entity.setExpectedOutcome(sd.getExpectedOutcome());
                entity.setScheduledDate(sd.getScheduledDate());
                syllabusSessionRepository.save(entity);
            }
        }

        return getSyllabus(classSessionId);
    }

    @Transactional
    public ClassSyllabusDTO submitSyllabus(Long classSessionId) {
        ClassSession session = classSessionRepository.findById(classSessionId)
                .orElseThrow(() -> new RuntimeException("Lớp học không tồn tại"));
        session.setSyllabusStatus("SUBMITTED");
        classSessionRepository.save(session);
        return getSyllabus(classSessionId);
    }

    @Transactional
    public ClassSyllabusDTO approveSyllabus(Long classSessionId) {
        ClassSession session = classSessionRepository.findById(classSessionId)
                .orElseThrow(() -> new RuntimeException("Lớp học không tồn tại"));
        session.setSyllabusStatus("APPROVED");
        classSessionRepository.save(session);
        return getSyllabus(classSessionId);
    }

    @Transactional
    public ClassSessionDTO tutorCancelClass(Long classSessionId, String reason, Long tutorProfileId) {
        ClassSession session = classSessionRepository.findById(classSessionId)
                .orElseThrow(() -> new RuntimeException("Lớp học không tồn tại"));
        
        if (session.getTutorProfileId() == null || !session.getTutorProfileId().equals(tutorProfileId)) {
            throw new RuntimeException("Bạn không phải gia sư của lớp này");
        }
        
        ClassSessionStatus status = session.getStatus();
        if (status != ClassSessionStatus.TRIAL && status != ClassSessionStatus.PENDING_PAYMENT && status != ClassSessionStatus.CONFIRMED) {
            throw new RuntimeException("Không thể hủy lớp ở trạng thái hiện tại");
        }
        
        session.setCancelReason(reason);
        session.setCancelledBy("TUTOR");
        
        if (status == ClassSessionStatus.CONFIRMED) {
            session.setStatus(ClassSessionStatus.PENDING_CANCELLATION);
            // TODO: Notify admin about refund and parent about cancellation
        } else {
            session.setStatus(ClassSessionStatus.CANCELLED);
            // TODO: Notify parent about cancellation
        }
        
        ClassSession saved = classSessionRepository.save(session);
        return mapToDTO(saved);
    }

    private SyllabusSessionDTO mapToSyllabusSessionDTO(SyllabusSession s) {
        SyllabusSessionDTO dto = new SyllabusSessionDTO();
        dto.setId(s.getId());
        dto.setSessionNumber(s.getSessionNumber());
        dto.setTitle(s.getTitle());
        dto.setContent(s.getContent());
        dto.setKeyKnowledge(s.getKeyKnowledge());
        dto.setExpectedOutcome(s.getExpectedOutcome());
        dto.setScheduledDate(s.getScheduledDate());
        return dto;
    }
}
