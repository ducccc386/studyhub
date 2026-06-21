package com.management.studyhub.controller;

import com.management.studyhub.repository.CommissionRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.HashMap;
import java.util.Map;
import com.management.studyhub.repository.UserRepository;
import com.management.studyhub.repository.CourseRepository;
import com.management.studyhub.repository.ClassSessionRepository;
import com.management.studyhub.repository.TutorProfileRepository;
import com.management.studyhub.entity.enums.EkycStatus;
import com.management.studyhub.service.AdminReportService;

@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminReportController {

    private final CommissionRecordRepository commissionRecordRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ClassSessionRepository classSessionRepository;
    private final TutorProfileRepository tutorProfileRepository;

    private final AdminReportService adminReportService;

    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueReport() {
        Double totalPlatformFee = commissionRecordRepository.getTotalPlatformFee();
        if (totalPlatformFee == null) totalPlatformFee = 0.0;

        Map<String, Object> response = new HashMap<>();
        response.put("totalPlatformFee", totalPlatformFee);
        
        long totalUsers = userRepository.count();
        long totalCourses = courseRepository.count();
        long successfulConnections = classSessionRepository.count();
        
        long pendingApprovals = tutorProfileRepository.findAll().stream()
                .filter(t -> t.getEkycStatus() == EkycStatus.PROCESSING)
                .count();

        response.put("totalUsers", totalUsers);
        response.put("totalCourses", totalCourses);
        response.put("successfulConnections", successfulConnections);
        response.put("pendingApprovals", pendingApprovals);
        // Có thể mở rộng thêm: doanh thu theo tháng, v.v.

        return ResponseEntity.ok(response);
    }

    @GetMapping("/kpis")
    public ResponseEntity<com.management.studyhub.dto.admin.AdminKpiDTO> getKpis() {
        return ResponseEntity.ok(adminReportService.getKpis());
    }

    @GetMapping("/growth")
    public ResponseEntity<java.util.List<com.management.studyhub.dto.admin.AdminGrowthDTO>> getGrowth() {
        return ResponseEntity.ok(adminReportService.getGrowth());
    }

    @GetMapping("/tutor-quality")
    public ResponseEntity<java.util.List<com.management.studyhub.dto.admin.AdminTutorQualityDTO>> getTutorQuality() {
        return ResponseEntity.ok(adminReportService.getTutorQuality());
    }

    @GetMapping("/popular-subjects")
    public ResponseEntity<java.util.List<com.management.studyhub.dto.admin.AdminPopularSubjectDTO>> getPopularSubjects() {
        return ResponseEntity.ok(adminReportService.getPopularSubjects());
    }
}
