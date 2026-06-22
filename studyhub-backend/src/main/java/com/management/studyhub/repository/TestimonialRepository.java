package com.management.studyhub.repository;

import com.management.studyhub.entity.Testimonial;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TestimonialRepository extends JpaRepository<Testimonial, Long> {

    @Query("SELECT t FROM Testimonial t ORDER BY t.stars DESC, LENGTH(t.quote) DESC")
    List<Testimonial> findFeaturedTestimonials(Pageable pageable);
}
