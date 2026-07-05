package com.management.studyhub.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Value("${cloudinary.cloud_name}")
    private String cloudName;

    @Value("${cloudinary.api_key}")
    private String apiKey;

    @Value("${cloudinary.api_secret}")
    private String apiSecret;

    private Cloudinary cloudinary;

    @PostConstruct
    public void init() {
        cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }

    public String uploadFile(MultipartFile file) throws IOException {
        if ("your_api_key_here".equals(apiKey) || apiKey == null || apiKey.trim().isEmpty()) {
            return "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
        }

        String originalFilename = file.getOriginalFilename();
        String resourceType = "auto";
        String extension = "";
        
        if (originalFilename != null) {
            String lower = originalFilename.toLowerCase();
            if (lower.lastIndexOf(".") != -1) {
                extension = lower.substring(lower.lastIndexOf("."));
            }
            if (lower.endsWith(".pdf") || lower.endsWith(".doc") || lower.endsWith(".docx") || lower.endsWith(".xls") || lower.endsWith(".xlsx")) {
                resourceType = "raw";
            }
        }

        Map<String, Object> options = new java.util.HashMap<>();
        options.put("resource_type", resourceType);
        
        if ("raw".equals(resourceType) && !extension.isEmpty()) {
            options.put("public_id", java.util.UUID.randomUUID().toString() + extension);
        }

        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
        return uploadResult.get("secure_url").toString();
    }
}
