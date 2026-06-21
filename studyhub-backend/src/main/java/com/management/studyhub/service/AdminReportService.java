package com.management.studyhub.service;

import com.management.studyhub.dto.admin.AdminGrowthDTO;
import com.management.studyhub.dto.admin.AdminKpiDTO;
import com.management.studyhub.dto.admin.AdminPopularSubjectDTO;
import com.management.studyhub.dto.admin.AdminTutorQualityDTO;
import com.management.studyhub.entity.TutorProfile;
import com.management.studyhub.entity.enums.ParentApprovalStatus;
import com.management.studyhub.entity.enums.TutorStatus;
import com.management.studyhub.repository.ClassSessionRepository;
import com.management.studyhub.repository.LessonLogRepository;
import com.management.studyhub.repository.TutorProfileRepository;
import com.management.studyhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AdminReportService {

    private final UserRepository userRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final LessonLogRepository lessonLogRepository;
    private final ClassSessionRepository classSessionRepository;

    @Transactional(readOnly = true)
    public AdminKpiDTO getKpis() {
        long activeTutors = tutorProfileRepository.countByStatus(TutorStatus.APPROVED);
        Double averageRating = lessonLogRepository.getOverallAverageRating();
        if (averageRating == null) averageRating = 0.0;
        
        // Mock growth 12%
        return new AdminKpiDTO(activeTutors, 12.0, Math.round(averageRating * 10.0) / 10.0);
    }

    @Transactional(readOnly = true)
    public List<AdminGrowthDTO> getGrowth() {
        List<AdminGrowthDTO> growthData = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM", new Locale("vi", "VN"));

        // Get data for last 6 months
        for (int i = 5; i >= 0; i--) {
            LocalDateTime startMonth = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime endMonth = startMonth.plusMonths(1).minusSeconds(1);
            
            long users = userRepository.countByCreatedAtBetween(startMonth, endMonth);
            String monthName = "Th " + startMonth.getMonthValue();
            
            // Return strictly real users from the database
            growthData.add(new AdminGrowthDTO(monthName, users));
        }
        return growthData;
    }

    @Transactional(readOnly = true)
    public List<AdminTutorQualityDTO> getTutorQuality() {
        List<TutorProfile> tutors = tutorProfileRepository.findByStatus(TutorStatus.APPROVED);
        List<AdminTutorQualityDTO> result = new ArrayList<>();

        for (TutorProfile tutor : tutors) {
            long disputes = lessonLogRepository.countByTutorProfileIdAndParentApprovalStatus(tutor.getId(), ParentApprovalStatus.DISPUTED);
            
            String status = disputes >= 3 ? "CẦN DUYỆT" : "XUẤT SẮC";
            if (disputes > 0 && disputes < 3) status = "CÓ VẤN ĐỀ";

            result.add(new AdminTutorQualityDTO(
                tutor.getId(),
                tutor.getFullName(),
                tutor.getAvatarUrl(),
                tutor.getAverageRating(),
                disputes,
                status
            ));
        }

        // Sort by disputes desc
        result.sort((a, b) -> Long.compare(b.getReportCount(), a.getReportCount()));
        
        return result.size() > 5 ? result.subList(0, 5) : result; // Return top 5
    }

    @Transactional(readOnly = true)
    public List<AdminPopularSubjectDTO> getPopularSubjects() {
        List<Object[]> results = classSessionRepository.findPopularSubjects();
        List<AdminPopularSubjectDTO> popularSubjects = new ArrayList<>();
        
        long totalClasses = 0;
        for (Object[] row : results) {
            totalClasses += (Long) row[1];
        }

        if (totalClasses == 0) return popularSubjects;

        for (Object[] row : results) {
            String subject = (String) row[0];
            Long count = (Long) row[1];
            int percentage = (int) Math.round((count * 100.0) / totalClasses);
            popularSubjects.add(new AdminPopularSubjectDTO(subject, count, percentage));
        }

        return popularSubjects.size() > 5 ? popularSubjects.subList(0, 5) : popularSubjects;
    }
}
