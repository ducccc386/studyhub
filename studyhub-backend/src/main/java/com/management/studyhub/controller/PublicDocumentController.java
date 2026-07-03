package com.management.studyhub.controller;

import com.management.studyhub.entity.PublicDocument;
import com.management.studyhub.service.PublicDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/public-documents")
@RequiredArgsConstructor
public class PublicDocumentController {

    private final PublicDocumentService publicDocumentService;

    @GetMapping
    public ResponseEntity<List<PublicDocument>> getAllDocuments() {
        return ResponseEntity.ok(publicDocumentService.getAllDocuments());
    }

    @PostMapping
    public ResponseEntity<?> uploadDocument(
            @RequestParam("uploaderId") Long uploaderId,
            @RequestParam("title") String title,
            @RequestParam(value = "schoolLevel", required = false) String schoolLevel,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam("file") MultipartFile file) {
        try {
            PublicDocument document = publicDocumentService.uploadDocument(uploaderId, title, schoolLevel, category, file);
            return ResponseEntity.ok(document);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi xử lý file: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        try {
            publicDocumentService.deleteDocument(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa tài liệu"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi khi xóa: " + e.getMessage()));
        }
    }
}
