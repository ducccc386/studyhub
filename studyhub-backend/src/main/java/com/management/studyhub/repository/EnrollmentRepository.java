package com.management.studyhub.repository;

import com.management.studyhub.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByParentId(Long parentId);
    List<Enrollment> findByCourseTutorId(Long tutorId);
    List<Enrollment> findByCourseId(Long courseId);
}
