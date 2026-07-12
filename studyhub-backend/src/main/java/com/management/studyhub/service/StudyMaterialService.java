package com.management.studyhub.service;

import com.management.studyhub.dto.StudyMaterialDTO;
import com.management.studyhub.entity.StudyMaterial;
import com.management.studyhub.entity.ClassSession;
import com.management.studyhub.entity.User;
import com.management.studyhub.repository.StudyMaterialRepository;
import com.management.studyhub.repository.ClassSessionRepository;
import com.management.studyhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudyMaterialService {

    private final StudyMaterialRepository studyMaterialRepository;
    private final ClassSessionRepository classSessionRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<StudyMaterialDTO> getMaterialsByClassSessionId(Long classSessionId) {
        return studyMaterialRepository.findByClassSessionIdOrderByUploadedAtDesc(classSessionId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional
    public StudyMaterialDTO uploadMaterial(Long classSessionId, Long uploaderId, String title, String materialType, String uploaderRole, MultipartFile file) throws IOException {
        ClassSession classSession = classSessionRepository.findById(classSessionId)
                .orElseThrow(() -> new RuntimeException("Lớp học không tồn tại"));

        // Kiểm tra quyền dựa theo role được truyền vào (không cần lookup DB)
        if ("OFFICIAL".equalsIgnoreCase(materialType) && !"ADMIN".equalsIgnoreCase(uploaderRole)) {
            throw new RuntimeException("Chỉ Admin mới có quyền tải lên tài liệu chính thức");
        }

        // Tìm user uploader để lưu
        User uploader = null;
        if (uploaderId != null) {
            uploader = userRepository.findById(uploaderId).orElse(null);
        }
        if (uploader == null) {
            uploader = userRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng trong hệ thống"));
        }

        String fileUrl = cloudinaryService.uploadFile(file);

        String originalFilename = file.getOriginalFilename();
        String fileType = "unknown";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileType = originalFilename.substring(originalFilename.lastIndexOf(".") + 1);
        }

        StudyMaterial material = new StudyMaterial();
        material.setClassSession(classSession);
        material.setUploader(uploader);
        material.setTitle(title);
        material.setFileUrl(fileUrl);
        material.setFileType(fileType);
        material.setMaterialType(materialType != null ? materialType.toUpperCase() : "REFERENCE");

        StudyMaterial saved = studyMaterialRepository.save(material);
        return mapToDTO(saved);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteMaterial(Long id) {
        studyMaterialRepository.deleteById(id);
    }

    private StudyMaterialDTO mapToDTO(StudyMaterial material) {
        StudyMaterialDTO dto = new StudyMaterialDTO();
        dto.setId(material.getId());
        dto.setClassSessionId(material.getClassSession().getId());
        dto.setUploaderId(material.getUploader().getId());
        dto.setUploaderName(material.getUploader().getFullName());
        dto.setTitle(material.getTitle());
        dto.setFileUrl(material.getFileUrl());
        dto.setFileType(material.getFileType());
        dto.setMaterialType(material.getMaterialType());
        dto.setUploadedAt(material.getUploadedAt());
        return dto;
    }
}
