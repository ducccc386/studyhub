package com.management.studyhub.controller;

import com.management.studyhub.dto.StudyMaterialDTO;
import com.management.studyhub.service.StudyMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/study-materials")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudyMaterialController {

    private final StudyMaterialService studyMaterialService;

    @GetMapping("/class/{classSessionId}")
    public ResponseEntity<List<StudyMaterialDTO>> getMaterials(@PathVariable Long classSessionId) {
        return ResponseEntity.ok(studyMaterialService.getMaterialsByClassSessionId(classSessionId));
    }

    @PostMapping("/class/{classSessionId}")
    public ResponseEntity<?> uploadMaterial(
            @PathVariable Long classSessionId,
            @RequestParam(value = "uploaderId", required = false) Long uploaderId,
            @RequestParam("title") String title,
            @RequestParam(value = "materialType", required = false, defaultValue = "REFERENCE") String materialType,
            @RequestParam(value = "uploaderRole", required = false, defaultValue = "TUTOR") String uploaderRole,
            @RequestParam("file") MultipartFile file) {
        try {
            StudyMaterialDTO dto = studyMaterialService.uploadMaterial(classSessionId, uploaderId, title, materialType, uploaderRole, file);
            return ResponseEntity.ok(dto);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi xử lý file: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMaterial(@PathVariable Long id) {
        try {
            studyMaterialService.deleteMaterial(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa tài liệu"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi khi xóa: " + e.getMessage()));
        }
    }
}
