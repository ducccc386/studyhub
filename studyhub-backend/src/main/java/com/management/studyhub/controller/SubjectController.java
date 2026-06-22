package com.management.studyhub.controller;

import com.management.studyhub.dto.SubjectDTO;
import com.management.studyhub.entity.Subject;
import com.management.studyhub.repository.SubjectRepository;
import com.management.studyhub.service.SubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;
    private final SubjectRepository subjectRepository;

    @GetMapping
    public ResponseEntity<List<SubjectDTO>> getAllSubjects() {
        return ResponseEntity.ok(subjectService.getAllSubjects());
    }

    @PostMapping
    public ResponseEntity<?> createSubject(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tên môn học không được để trống"));
        }
        Subject subject = new Subject();
        subject.setName(name.trim());
        Subject saved = subjectRepository.save(subject);
        return ResponseEntity.ok(Map.of("id", saved.getId(), "name", saved.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSubject(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tên môn học không được để trống"));
        }
        return subjectRepository.findById(id).map(subject -> {
            subject.setName(name.trim());
            subjectRepository.save(subject);
            return ResponseEntity.ok(Map.of("id", subject.getId(), "name", subject.getName()));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubject(@PathVariable Integer id) {
        try {
            subjectRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa môn học"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Không thể xóa môn học đang được sử dụng"));
        }
    }
}
