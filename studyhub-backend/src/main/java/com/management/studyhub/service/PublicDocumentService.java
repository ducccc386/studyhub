package com.management.studyhub.service;

import com.management.studyhub.entity.PublicDocument;
import com.management.studyhub.repository.PublicDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PublicDocumentService {

    private final PublicDocumentRepository publicDocumentRepository;
    private final CloudinaryService cloudinaryService;

    public List<PublicDocument> getAllDocuments() {
        return publicDocumentRepository.findAll();
    }

    public PublicDocument uploadDocument(Long uploaderId, String title, String schoolLevel, String grade, String subject, String category, MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new RuntimeException("Chỉ cho phép tải lên file định dạng PDF");
        }

        String fileUrl = cloudinaryService.uploadFile(file);

        PublicDocument document = new PublicDocument();
        document.setTitle(title);
        document.setFileUrl(fileUrl);
        document.setUploadedBy(uploaderId);
        document.setSchoolLevel(schoolLevel);
        document.setGrade(grade);
        document.setSubject(subject);
        document.setCategory(category);

        return publicDocumentRepository.save(document);
    }

    public void deleteDocument(Long id) {
        publicDocumentRepository.deleteById(id);
    }
}
