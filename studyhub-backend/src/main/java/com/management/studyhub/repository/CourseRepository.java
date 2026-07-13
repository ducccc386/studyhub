package com.management.studyhub.repository;

import com.management.studyhub.entity.Course;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    // Eagerly fetch tutor & subject to avoid LazyInitializationException
    @Query("SELECT c FROM Course c LEFT JOIN FETCH c.tutor t LEFT JOIN FETCH c.subject LEFT JOIN t.user u WHERE (u.status IS NULL OR u.status = 'ACTIVE') AND (c.status IS NULL OR c.status = 'ACTIVE') ORDER BY c.rating DESC, c.reviewCount DESC")
    List<Course> findFeaturedCourses(Pageable pageable);

    @Query("SELECT DISTINCT c FROM Course c LEFT JOIN FETCH c.tutor t LEFT JOIN FETCH c.subject s LEFT JOIN t.user u WHERE s.id IN :subjectIds AND (u.status IS NULL OR u.status = 'ACTIVE')")
    List<Course> findBySubjectIdIn(@org.springframework.data.repository.query.Param("subjectIds") List<Integer> subjectIds);

    @Query("SELECT DISTINCT c FROM Course c LEFT JOIN FETCH c.tutor t LEFT JOIN FETCH c.subject LEFT JOIN t.user u WHERE (u.status IS NULL OR u.status = 'ACTIVE')")
    List<Course> findAllActiveCourses();

    List<Course> findByTutorId(Long tutorId);

    @Query("SELECT DISTINCT c FROM Course c LEFT JOIN FETCH c.tutor LEFT JOIN FETCH c.subject WHERE c.tutor.id = :tutorId")
    List<Course> findByTutorIdFetched(@org.springframework.data.repository.query.Param("tutorId") Long tutorId);

    @Query("SELECT DISTINCT c FROM Course c LEFT JOIN FETCH c.tutor t LEFT JOIN FETCH c.subject WHERE c.status = :status")
    List<Course> findByStatus(@org.springframework.data.repository.query.Param("status") String status);
}
