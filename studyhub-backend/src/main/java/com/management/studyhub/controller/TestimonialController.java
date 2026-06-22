package com.management.studyhub.controller;

import com.management.studyhub.dto.TestimonialDto;
import com.management.studyhub.service.TestimonialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/testimonials")
@RequiredArgsConstructor
public class TestimonialController {

    private final TestimonialService testimonialService;

    @GetMapping("/featured")
    public ResponseEntity<List<TestimonialDto>> getFeaturedTestimonials() {
        return ResponseEntity.ok(testimonialService.getFeaturedTestimonials());
    }
}
