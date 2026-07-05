package com.management.studyhub.service;

import com.management.studyhub.dto.EnrollmentDto;
import com.management.studyhub.dto.EnrollmentRequestDto;
import com.management.studyhub.entity.Course;
import com.management.studyhub.entity.Enrollment;
import com.management.studyhub.entity.User;
import com.management.studyhub.repository.CourseRepository;
import com.management.studyhub.repository.EnrollmentRepository;
import com.management.studyhub.repository.UserRepository;
import com.management.studyhub.repository.ClassSessionRepository;
import com.management.studyhub.repository.ParentRepository;
import com.management.studyhub.entity.ClassSession;
import com.management.studyhub.entity.enums.ClassSessionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ClassSessionRepository classSessionRepository;
    private final ParentRepository parentRepository;

    @Override
    public EnrollmentDto createEnrollment(Long parentId, EnrollmentRequestDto requestDto) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        Course course = courseRepository.findById(requestDto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Enrollment enrollment = new Enrollment();
        enrollment.setParent(parent);
        enrollment.setCourse(course);
        enrollment.setStudentName(requestDto.getStudentName());
        enrollment.setStudentGrade(requestDto.getStudentGrade());
        enrollment.setStudentLevel(requestDto.getStudentLevel());
        enrollment.setNotes(requestDto.getNotes());
        enrollment.setStatus("PENDING");

        return mapToDto(enrollmentRepository.save(enrollment));
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<EnrollmentDto> getEnrollmentsByParentId(Long parentId) {
        return enrollmentRepository.findByParentId(parentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<EnrollmentDto> getEnrollmentsByTutorId(Long tutorId) {
        return enrollmentRepository.findByCourseTutorId(tutorId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public EnrollmentDto approveEnrollment(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        enrollment.setStatus("APPROVED");
        
        // Cập nhật trạng thái Course thành CLOSED khi đã có phụ huynh kết nối thành công
        if (enrollment.getCourse() != null) {
            Course course = enrollment.getCourse();
            course.setStatus("CLOSED");
            courseRepository.save(course);
        }
        
        // Tạo Lớp học (Class Session) khi gia sư đồng ý
        ClassSession classSession = new ClassSession();
        
        if (enrollment.getParent() != null) {
            classSession.setParent(parentRepository.findByUserId(enrollment.getParent().getId()).orElse(null));
            classSession.setParentName(enrollment.getParent().getFullName());
        } else {
            classSession.setParentName(enrollment.getStudentName() != null ? enrollment.getStudentName() : "Khách");
        }
        
        if (enrollment.getCourse() != null && enrollment.getCourse().getTutor() != null) {
            classSession.setTutorProfileId(enrollment.getCourse().getTutor().getId());
            classSession.setTutorName(enrollment.getCourse().getTutor().getFullName());
            classSession.setTutorAvatar(enrollment.getCourse().getTutor().getAvatarUrl());
            classSession.setSubject(enrollment.getCourse().getSubject() != null ? enrollment.getCourse().getSubject().getName() : "Môn học");
            classSession.setClassName(enrollment.getCourse().getTitle() + " - " + enrollment.getStudentName());
            classSession.setSchedule(enrollment.getCourse().getSchedule());
            
            String priceStr = enrollment.getCourse().getPrice();
            if (priceStr != null) {
                try {
                    String cleanPrice = priceStr.replaceAll("[^\\d]", "");
                    if (!cleanPrice.isEmpty()) {
                        classSession.setPricePerSession(Double.parseDouble(cleanPrice));
                    }
                } catch (Exception e) {
                    classSession.setPricePerSession(0.0);
                }
            }
            
            classSession.setLearningMode(enrollment.getCourse().getLocationType() != null && enrollment.getCourse().getLocationType().toLowerCase().contains("online") ? "ONLINE" : "OFFLINE");
            classSession.setAddress(enrollment.getCourse().getLocation());
        }
        
        classSession.setStatus(ClassSessionStatus.TRIAL); // Bắt đầu học thử
        classSessionRepository.save(classSession);

        return mapToDto(enrollmentRepository.save(enrollment));
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public EnrollmentDto rejectEnrollment(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        enrollment.setStatus("REJECTED");
        return mapToDto(enrollmentRepository.save(enrollment));
    }

    private EnrollmentDto mapToDto(Enrollment enrollment) {
        EnrollmentDto dto = new EnrollmentDto();
        dto.setId(enrollment.getId());
        if (enrollment.getParent() != null) {
            dto.setParentId(enrollment.getParent().getId());
            dto.setParentName(enrollment.getParent().getFullName());
        }
        if (enrollment.getCourse() != null) {
            dto.setCourseId(enrollment.getCourse().getId());
            dto.setCourseTitle(enrollment.getCourse().getTitle());
            dto.setCourseImage(enrollment.getCourse().getImage());
            dto.setCourseSchedule(enrollment.getCourse().getSchedule());
            dto.setCourseTime(enrollment.getCourse().getSchedule()); // fallback
            
            if (enrollment.getCourse().getTutor() != null) {
                dto.setTutorName(enrollment.getCourse().getTutor().getFullName());
                dto.setTutorAvatar(enrollment.getCourse().getTutor().getAvatarUrl());
            }
        }
        dto.setStudentName(enrollment.getStudentName());
        dto.setStudentGrade(enrollment.getStudentGrade());
        dto.setStudentLevel(enrollment.getStudentLevel());
        dto.setNotes(enrollment.getNotes());
        dto.setStatus(enrollment.getStatus());
        dto.setCreatedAt(enrollment.getCreatedAt());
        return dto;
    }
}
