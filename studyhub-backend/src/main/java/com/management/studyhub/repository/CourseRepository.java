package com.management.studyhub.repository;

import com.management.studyhub.entity.Course;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("SELECT c FROM Course c LEFT JOIN c.tutor t LEFT JOIN t.user u WHERE (u.status IS NULL OR u.status = 'ACTIVE') AND (c.status IS NULL OR c.status = 'ACTIVE') ORDER BY c.rating DESC, c.reviewCount DESC")
    List<Course> findFeaturedCourses(Pageable pageable);

    @Query("SELECT c FROM Course c LEFT JOIN c.tutor t LEFT JOIN t.user u LEFT JOIN c.subject s WHERE s.id IN :subjectIds AND (u.status IS NULL OR u.status = 'ACTIVE')")
    List<Course> findBySubjectIdIn(@org.springframework.data.repository.query.Param("subjectIds") List<Integer> subjectIds);

    @Query("SELECT c FROM Course c LEFT JOIN c.tutor t LEFT JOIN t.user u WHERE (u.status IS NULL OR u.status = 'ACTIVE')")
    List<Course> findAllActiveCourses();

    List<Course> findByTutorId(Long tutorId);
}
