package com.management.studyhub.repository;

import com.management.studyhub.entity.Course;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("SELECT c FROM Course c ORDER BY c.rating DESC, c.reviewCount DESC")
    List<Course> findFeaturedCourses(Pageable pageable);

    @Query("SELECT c FROM Course c WHERE c.subject.id IN :subjectIds")
    List<Course> findBySubjectIdIn(@org.springframework.data.repository.query.Param("subjectIds") List<Integer> subjectIds);
}
