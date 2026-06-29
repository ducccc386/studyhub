package com.management.studyhub.repository;

import com.management.studyhub.entity.Course;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("SELECT c FROM Course c WHERE (c.tutor.user.status IS NULL OR c.tutor.user.status = 'ACTIVE') AND (c.status IS NULL OR c.status = 'ACTIVE') ORDER BY c.rating DESC, c.reviewCount DESC")
    List<Course> findFeaturedCourses(Pageable pageable);

    @Query("SELECT c FROM Course c WHERE c.subject.id IN :subjectIds AND (c.tutor.user.status IS NULL OR c.tutor.user.status = 'ACTIVE')")
    List<Course> findBySubjectIdIn(@org.springframework.data.repository.query.Param("subjectIds") List<Integer> subjectIds);

    @Query("SELECT c FROM Course c WHERE (c.tutor.user.status IS NULL OR c.tutor.user.status = 'ACTIVE')")
    List<Course> findAllActiveCourses();
}
