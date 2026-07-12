package com.management.studyhub.service;

import com.management.studyhub.dto.ApplicantDTO;
import com.management.studyhub.dto.JobPostingDTO;
import com.management.studyhub.entity.Applicant;
import com.management.studyhub.entity.JobPosting;
import com.management.studyhub.entity.Parent;
import com.management.studyhub.repository.ApplicantRepository;
import com.management.studyhub.repository.JobPostingRepository;
import com.management.studyhub.repository.ParentRepository;
import com.management.studyhub.repository.UserRepository;
import com.management.studyhub.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobPostingService {

    private final JobPostingRepository jobPostingRepository;
    private final ParentRepository parentRepository;
    private final ApplicantRepository applicantRepository;
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

    @org.springframework.transaction.annotation.Transactional
    public JobPostingDTO createPost(Long userId, JobPostingDTO dto) {
        try {
            Parent parent = getOrCreateParent(userId);

            JobPosting job = new JobPosting();
            job.setParent(parent);
            job.setTitle(dto.getTitle());
            job.setSubject(dto.getSubject());
            job.setClassLevel(dto.getClassLevel());
            job.setDescription(dto.getDescription());
            job.setPostedAt(LocalDateTime.now());
            job.setStatus("RECRUITING"); // Hoặc PENDING_APPROVAL
            job.setLocation(dto.getLocation());
            job.setDetailedAddress(dto.getDetailedAddress());
            job.setSchedule(dto.getSchedule());
            job.setPricePerSession(dto.getPricePerSession());
            job.setLearningMode(dto.getLearningMode());
            job.setRequirement(dto.getRequirement());
            job.setApplicantsCount(0);
            job.setTutorGenderPreference("ANY"); // Default to ANY to avoid NULL constraint violations

            JobPosting savedJob = jobPostingRepository.save(job);
            return mapToDTO(savedJob);
        } catch (Exception e) {
            System.err.println(">>> ERROR IN createPost: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi lưu bài đăng: " + e.getMessage(), e);
        }
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<JobPostingDTO> getAllRecruitingPosts() {
        return jobPostingRepository.findActiveByStatus("RECRUITING")
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<JobPostingDTO> getPostsByParent(Long userId) {
        Parent parent = getOrCreateParent(userId);

        return jobPostingRepository.findByParentId(parent.getId())
                .stream()
                .map(post -> {
                    JobPostingDTO dto = mapToDTO(post);
                    // Lấy luôn danh sách ứng viên cho bài đăng này
                    List<ApplicantDTO> applicants = applicantRepository.findByJobPostingId(post.getId())
                            .stream()
                            .map(this::mapApplicantToDTO)
                            .collect(Collectors.toList());
                    dto.setApplicants(applicants);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<JobPostingDTO> getPendingPosts() {
        return jobPostingRepository.findByStatus("PENDING_APPROVAL")
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public JobPostingDTO getPostById(Long id) {
        return jobPostingRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Job posting not found"));
    }

    public void approvePost(Long id) {
        JobPosting job = jobPostingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job posting not found"));
        job.setStatus("RECRUITING");
        jobPostingRepository.save(job);
    }

    public void rejectPost(Long id) {
        JobPosting job = jobPostingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job posting not found"));
        job.setStatus("CLOSED");
        jobPostingRepository.save(job);
    }

    @org.springframework.transaction.annotation.Transactional
    public JobPostingDTO updatePost(Long id, JobPostingDTO dto) {
        try {
            JobPosting job = jobPostingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bài đăng"));
            if (dto.getTitle() != null && !dto.getTitle().isBlank()) job.setTitle(dto.getTitle());
            if (dto.getSubject() != null) job.setSubject(dto.getSubject());
            if (dto.getClassLevel() != null) job.setClassLevel(dto.getClassLevel());
            if (dto.getDescription() != null) job.setDescription(dto.getDescription());
            if (dto.getLocation() != null) job.setLocation(dto.getLocation());
            if (dto.getDetailedAddress() != null) job.setDetailedAddress(dto.getDetailedAddress());
            if (dto.getSchedule() != null) job.setSchedule(dto.getSchedule());
            if (dto.getPricePerSession() != null) job.setPricePerSession(dto.getPricePerSession());
            if (dto.getLearningMode() != null) job.setLearningMode(dto.getLearningMode());
            if (dto.getRequirement() != null) job.setRequirement(dto.getRequirement());
            
            if (job.getTutorGenderPreference() == null) {
                job.setTutorGenderPreference("ANY");
            }
            
            JobPosting savedJob = jobPostingRepository.save(job);
            return mapToDTO(savedJob);
        } catch (Exception e) {
            System.err.println(">>> ERROR IN updatePost: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi cập nhật bài đăng: " + e.getMessage(), e);
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public void deletePost(Long id) {
        try {
            if (!jobPostingRepository.existsById(id)) {
                throw new RuntimeException("Không tìm thấy bài đăng");
            }
            applicantRepository.deleteByJobPostingId(id);
            jobPostingRepository.deleteById(id);
        } catch (Exception e) {
            System.err.println(">>> ERROR IN deletePost: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi xóa bài đăng: " + e.getMessage(), e);
        }
    }

    /**
     * Lấy danh sách ứng viên theo postId
     */
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<ApplicantDTO> getApplicantsByPost(Long postId) {
        return applicantRepository.findByJobPostingId(postId)
                .stream()
                .map(this::mapApplicantToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Gia sư xem các đơn mình đã nộp, kèm thông tin bài đăng
     */
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<ApplicantDTO> getMyApplications(Long tutorProfileId) {
        return applicantRepository.findByTutorId(String.valueOf(tutorProfileId))
                .stream()
                .map(a -> {
                    ApplicantDTO dto = mapApplicantToDTO(a);
                    // Gắn thêm thông tin bài đăng vào DTO
                    if (a.getJobPosting() != null) {
                        JobPosting post = a.getJobPosting();
                        dto.setPostTitle(post.getTitle());
                        dto.setPostSubject(post.getSubject());
                        dto.setPostClassLevel(post.getClassLevel());
                        dto.setPostSchedule(post.getSchedule());
                        dto.setPostPricePerSession(post.getPricePerSession());
                        dto.setPostLearningMode(post.getLearningMode());
                        dto.setPostStatus(post.getStatus());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * Gia sư nộp đơn ứng tuyển bài đăng
     */
    public ApplicantDTO applyToPost(Long postId, Long tutorProfileId, String tutorName,
                                    String tutorAvatar, String tutorTitle, String message) {
        JobPosting post = jobPostingRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("JobPosting not found"));

        // Kiểm tra đã apply chưa
        boolean alreadyApplied = applicantRepository.findByJobPostingId(postId)
                .stream()
                .anyMatch(a -> String.valueOf(tutorProfileId).equals(a.getTutorId()));
        if (alreadyApplied) throw new RuntimeException("Bạn đã nộp đơn cho bài đăng này rồi");

        Applicant applicant = new Applicant();
        applicant.setJobPosting(post);
        applicant.setTutorId(String.valueOf(tutorProfileId));
        applicant.setTutorName(tutorName);
        applicant.setTutorAvatar(tutorAvatar);
        applicant.setTutorTitle(tutorTitle);
        applicant.setMessage(message);
        applicant.setStatus("PENDING");
        applicant.setAppliedAt(LocalDateTime.now());

        // Tăng số ứng viên
        post.setApplicantsCount((post.getApplicantsCount() == null ? 0 : post.getApplicantsCount()) + 1);
        jobPostingRepository.save(post);

        return mapApplicantToDTO(applicantRepository.save(applicant));
    }

    private ApplicantDTO mapApplicantToDTO(Applicant a) {
        ApplicantDTO dto = new ApplicantDTO();
        dto.setId(a.getId());
        if (a.getJobPosting() != null) dto.setJobPostingId(a.getJobPosting().getId());
        dto.setTutorId(a.getTutorId());
        dto.setTutorName(a.getTutorName());
        dto.setTutorAvatar(a.getTutorAvatar());
        dto.setTutorTitle(a.getTutorTitle());
        dto.setTutorRating(a.getTutorRating());
        dto.setTutorReviews(a.getTutorReviews());
        dto.setMessage(a.getMessage());
        dto.setStatus(a.getStatus());
        dto.setAppliedAt(a.getAppliedAt());
        return dto;
    }

    private JobPostingDTO mapToDTO(JobPosting job) {
        JobPostingDTO dto = new JobPostingDTO();
        dto.setId(job.getId());
        if (job.getParent() != null && job.getParent().getUser() != null) {
            dto.setParentId(job.getParent().getId());
            dto.setParentName(job.getParent().getUser().getFullName());
            dto.setParentAvatar(job.getParent().getUser().getAvatarUrl());
        }
        dto.setTitle(job.getTitle());
        dto.setSubject(job.getSubject());
        dto.setClassLevel(job.getClassLevel());
        dto.setDescription(job.getDescription());
        dto.setPostedAt(job.getPostedAt());
        dto.setStatus(job.getStatus());
        dto.setLocation(job.getLocation());
        dto.setDetailedAddress(job.getDetailedAddress());
        dto.setSchedule(job.getSchedule());
        dto.setPricePerSession(job.getPricePerSession());
        dto.setLearningMode(job.getLearningMode());
        dto.setRequirement(job.getRequirement());
        dto.setApplicantsCount(job.getApplicantsCount() == null ? 0 : job.getApplicantsCount());
        return dto;
    }
}
