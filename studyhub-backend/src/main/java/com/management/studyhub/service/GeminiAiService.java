package com.management.studyhub.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.management.studyhub.dto.CvParsedResultDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeminiAiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public CvParsedResultDTO parseCv(MultipartFile file) throws Exception {
        String base64Data = Base64.getEncoder().encodeToString(file.getBytes());
        String mimeType = file.getContentType();
        if (mimeType == null) mimeType = "image/jpeg";

        // Construct request payload
        Map<String, Object> inlineData = new HashMap<>();
        inlineData.put("mime_type", mimeType);
        inlineData.put("data", base64Data);

        Map<String, Object> inlineDataPart = new HashMap<>();
        inlineDataPart.put("inline_data", inlineData);

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", "Bạn là một hệ thống trích xuất thông tin CV. Hãy đọc CV này và trích xuất các thông tin sau thành MỘT CẤU TRÚC JSON DUY NHẤT. " +
                "KHÔNG bọc JSON trong block code markdown (vd: không dùng ```json). Chỉ xuất ra JSON thuần túy. " +
                "Nếu không tìm thấy thông tin nào, hãy để null. " +
                "Các trường cần thiết: " +
                "fullName (String), " +
                "phoneNumber (String), " +
                "email (String), " +
                "universityName (String), " +
                "major (String), " +
                "experienceYears (Integer, ví dụ: nếu chưa có thì 0, dưới 1 năm thì 1, 1-3 năm thì 2, trên 3 năm thì 4), " +
                "introduction (String, tổng hợp các thành tích, mục tiêu, và kỹ năng thành một đoạn văn ngắn gọn).");

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(textPart, inlineDataPart));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(content));

        String jsonBody = objectMapper.writeValueAsString(requestBody);

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Lỗi từ Gemini API: " + response.body());
        }

        JsonNode rootNode = objectMapper.readTree(response.body());
        String extractedText = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

        // Xử lý loại bỏ block markdown nếu Gemini vẫn cố tình sinh ra
        if (extractedText.startsWith("```json")) {
            extractedText = extractedText.substring(7);
        } else if (extractedText.startsWith("```")) {
            extractedText = extractedText.substring(3);
        }
        if (extractedText.endsWith("```")) {
            extractedText = extractedText.substring(0, extractedText.length() - 3);
        }
        extractedText = extractedText.trim();

        return objectMapper.readValue(extractedText, CvParsedResultDTO.class);
    }
}
