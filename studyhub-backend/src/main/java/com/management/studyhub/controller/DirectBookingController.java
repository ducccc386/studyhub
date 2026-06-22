package com.management.studyhub.controller;

import com.management.studyhub.dto.DirectBookingDTO;
import com.management.studyhub.service.DirectBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class DirectBookingController {
    private final DirectBookingService bookingService;

    @PostMapping
    public ResponseEntity<DirectBookingDTO> createBooking(@RequestBody DirectBookingDTO dto) {
        return ResponseEntity.ok(bookingService.createBooking(dto));
    }

    @GetMapping("/parent/{parentId}")
    public ResponseEntity<List<DirectBookingDTO>> getBookingsByParent(@PathVariable Long parentId) {
        return ResponseEntity.ok(bookingService.getBookingsByParent(parentId));
    }

    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<List<DirectBookingDTO>> getBookingsByTutor(@PathVariable Long tutorId) {
        return ResponseEntity.ok(bookingService.getBookingsByTutor(tutorId));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<DirectBookingDTO> acceptBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.acceptBooking(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<DirectBookingDTO> rejectBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.rejectBooking(id));
    }
}
