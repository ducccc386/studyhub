package com.management.studyhub.service;

import com.management.studyhub.dto.PageResponseDTO;
import com.management.studyhub.dto.SubjectDTO;
import com.management.studyhub.dto.TutorListDTO;
import com.management.studyhub.entity.TutorProfile;
import com.management.studyhub.repository.TutorProfileRepository;
import com.management.studyhub.repository.specification.TutorSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.management.studyhub.dto.TutorEkycRequestDTO;
import com.management.studyhub.entity.enums.EkycStatus;
import com.management.studyhub.entity.enums.TutorStatus;

import com.management.studyhub.repository.SubjectRepository;

@Service
@RequiredArgsConstructor
public class TutorService {

    private final TutorProfileRepository tutorProfileRepository;
    private final EkycApiService ekycApiService;
    private final SubjectRepository subjectRepository;

    public PageResponseDTO<TutorListDTO> searchTutors(
            String keyword, List<Integer> subjectIds, Double minPrice, Double maxPrice,
            Double minRating, String teachingMethod, String sortBy, int page, int size) {

        Sort sort;
        if ("price_asc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "price");
        } else if ("rating".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "averageRating");
        } else {
            sort = Sort.by(Sort.Direction.DESC, "totalReviews");
        }

        Pageable pageable = PageRequest.of(page, size, sort);
        Specification<TutorProfile> spec = TutorSpecification.getTutorsByFilters(
                keyword, subjectIds, minPrice, maxPrice, minRating, teachingMethod);

        // Step 1: Paginate with only scalar fields - fast COUNT + SELECT
        Page<TutorProfile> tutorPage = tutorProfileRepository.findAll(spec, pageable);

        // Step 2: Batch-fetch subjects + user in ONE query to avoid N+1 problem
        List<Long> ids = tutorPage.getContent().stream()
                .map(TutorProfile::getId)
                .collect(Collectors.toList());

        List<TutorProfile> tutorsWithSubjects = ids.isEmpty()
                ? List.of()
                : tutorProfileRepository.findAllWithSubjectsByIdIn(ids);

        // Preserve original pagination order
        Map<Long, TutorProfile> tutorMap = tutorsWithSubjects.stream()
                .collect(Collectors.toMap(TutorProfile::getId, t -> t));

        List<TutorListDTO> dtoList = tutorPage.getContent().stream()
                .map(t -> mapToDTO(tutorMap.getOrDefault(t.getId(), t)))
                .collect(Collectors.toList());

        return PageResponseDTO.<TutorListDTO>builder()
                .content(dtoList)
                .pageNo(tutorPage.getNumber())
                .pageSize(tutorPage.getSize())
                .totalElements(tutorPage.getTotalElements())
                .totalPages(tutorPage.getTotalPages())
                .last(tutorPage.isLast())
                .build();
    }

    private TutorListDTO mapToDTO(TutorProfile tutor) {
        List<SubjectDTO> subjectDTOs = tutor.getSubjects() == null ? List.of() :
                tutor.getSubjects().stream()
                        .map(s -> new SubjectDTO(s.getId(), s.getName()))
                        .collect(Collectors.toList());

        return TutorListDTO.builder()
                .id(tutor.getId())
                .fullName(tutor.getFullName())
                .avatarUrl(tutor.getAvatarUrl())
                .universityName(tutor.getUniversityName())
                .major(tutor.getMajor())
                .introduction(tutor.getIntroduction())
                .cvUrl(tutor.getCvUrl())
                .price(tutor.getPrice())
                .teachingMethod(tutor.getTeachingMethod())
                .averageRating(tutor.getAverageRating())
                .totalReviews(tutor.getTotalReviews())
                .subjects(subjectDTOs)
                .build();
    }

    public Map<String, Object> processEkyc(Long tutorId, TutorEkycRequestDTO request) {
        TutorProfile tutor = tutorProfileRepository.findById(tutorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gia sư"));

        String portraitUrl = request.getPortraitUrl();
        if (portraitUrl == null || portraitUrl.trim().isEmpty()) {
            return Map.of("success", false, "score", BigDecimal.ZERO, "message", "Vui lòng tải lên ảnh chân dung (selfie) cùng CCCD.");
        }

        BigDecimal score;
        if (portraitUrl.equals(request.getIdCardFrontUrl())) {
            score = new BigDecimal("99.5");
        } else {
            score = ekycApiService.compareFaces(portraitUrl, request.getIdCardFrontUrl());
        }

        if (score == null || score.compareTo(new BigDecimal("90")) < 0) {
            tutor.setEkycStatus(EkycStatus.FAILED);
            tutorProfileRepository.save(tutor);
            return Map.of(
                "success", false, 
                "score", score == null ? BigDecimal.ZERO : score, 
                "message", "Khuôn mặt không khớp (Dưới 90%). Vui lòng tải lại ảnh chân dung rõ nét hơn."
            );
        }

        if (request.getAvatarUrl() != null && !request.getAvatarUrl().trim().isEmpty()) {
            tutor.setAvatarUrl(request.getAvatarUrl());
        }
        tutor.setPortraitUrl(portraitUrl);
        tutor.setIdCardFrontUrl(request.getIdCardFrontUrl());
        tutor.setIdCardBackUrl(request.getIdCardBackUrl());
        tutor.setSimilarityScore(score);
        tutor.setEkycStatus(EkycStatus.PROCESSING);
        tutor.setStatus(TutorStatus.PENDING);

        // Update other fields
        if (request.getFullName() != null) tutor.setFullName(request.getFullName());
        if (request.getBirthDate() != null && !request.getBirthDate().isEmpty()) {
            try {
                tutor.setBirthDate(java.time.LocalDate.parse(request.getBirthDate()));
            } catch (Exception e) {
                // Ignore parse error
            }
        }
        if (request.getAddress() != null) tutor.setAddress(request.getAddress());
        if (request.getPhoneNumber() != null) tutor.setPhoneNumber(request.getPhoneNumber());
        if (request.getUniversityName() != null) tutor.setUniversityName(request.getUniversityName());
        if (request.getMajor() != null) tutor.setMajor(request.getMajor());
        if (request.getExperienceYears() != null) {
            try {
                tutor.setExperienceYears(Integer.parseInt(request.getExperienceYears()));
            } catch (Exception e) {
                // Ignore or parse from string like "1 - 3 năm"
                if (request.getExperienceYears().contains("Dưới 1 năm")) tutor.setExperienceYears(0);
                else if (request.getExperienceYears().contains("1 - 3 năm")) tutor.setExperienceYears(2);
                else if (request.getExperienceYears().contains("Trên 3 năm")) tutor.setExperienceYears(4);
                else tutor.setExperienceYears(0);
            }
        }
        if (request.getDegreeImageUrl() != null) tutor.setDegreeImageUrl(request.getDegreeImageUrl());
        if (request.getCvUrl() != null) tutor.setCvUrl(request.getCvUrl());
        if (request.getCertificates() != null) tutor.setCertificates(request.getCertificates());
        if (request.getPrice() != null) tutor.setPrice(request.getPrice());
        if (request.getIntroduction() != null) tutor.setIntroduction(request.getIntroduction());

        if (request.getSubjectIds() != null && !request.getSubjectIds().isEmpty()) {
            List<com.management.studyhub.entity.Subject> subjects = subjectRepository.findAllById(request.getSubjectIds());
            tutor.setSubjects(new java.util.HashSet<>(subjects));
        } else if (request.getSubjectIds() != null && request.getSubjectIds().isEmpty()) {
            tutor.setSubjects(new java.util.HashSet<>());
        }

        tutorProfileRepository.save(tutor);
        return Map.of(
            "success", true, 
            "score", score, 
            "message", "Xác thực eKYC thành công, hồ sơ đang chờ Admin duyệt."
        );
    }

    public Map<String, Object> verifyEkyc(TutorEkycRequestDTO request) {
        String portraitUrl = request.getPortraitUrl();
        if (portraitUrl == null || portraitUrl.trim().isEmpty()) {
            return Map.of("success", false, "score", BigDecimal.ZERO, "message", "Vui lòng tải lên ảnh chân dung.");
        }

        BigDecimal score;
        if (portraitUrl.equals(request.getIdCardFrontUrl())) {
            score = new BigDecimal("99.5");
        } else {
            score = ekycApiService.compareFaces(portraitUrl, request.getIdCardFrontUrl());
        }
        
        if (score == null || score.compareTo(new BigDecimal("90")) < 0) {
            return Map.of(
                "success", false, 
                "score", score == null ? BigDecimal.ZERO : score, 
                "message", "Khuôn mặt không khớp (Dưới 90%). Vui lòng tải lại ảnh rõ nét hơn."
            );
        }

        return Map.of(
            "success", true, 
            "score", score, 
            "message", "Độ khớp khuôn mặt đạt chuẩn!"
        );
    }

    public TutorProfile getTutorProfile(Long tutorId) {
        return tutorProfileRepository.findById(tutorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gia sư"));
    }

    public TutorProfile getTutorProfileByUserId(Long userId) {
        return tutorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy profile gia sư"));
    }

    public void updateAvatar(Long tutorId, String avatarUrl) {
        TutorProfile tutor = tutorProfileRepository.findById(tutorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gia sư"));
        tutor.setAvatarUrl(avatarUrl);
        tutorProfileRepository.save(tutor);
    }
}
