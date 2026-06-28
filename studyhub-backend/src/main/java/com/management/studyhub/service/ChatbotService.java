package com.management.studyhub.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class ChatbotService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=";

    private final String systemPrompt = "Bạn là trợ lý ảo nhiệt tình, chuyên nghiệp của nền tảng kết nối gia sư StudyHub. " +
            "Nhiệm vụ của bạn là giải đáp thắc mắc cho Phụ Huynh và Gia Sư dựa trên các luật nghiệp vụ (Business Logic) cốt lõi sau:\n\n" +
            "1. CÁCH TÌM GIA SƯ / LỚP HỌC:\n" +
            "- Phụ huynh có thể: Đăng bài tuyển gia sư (Job Posting) để gia sư ứng tuyển (Tutor Application), HOẶC Đăng ký (Enrollment) vào các Khóa học do gia sư tạo sẵn, HOẶC Đặt lịch trực tiếp (Direct Booking) với gia sư.\n\n" +
            "2. HỌC PHÍ & CHÍNH SÁCH THANH TOÁN:\n" +
            "- Tổng học phí khóa học được tính bằng: [Mức giá 1 ca] x [Tổng số ca học].\n" +
            "- Để xác nhận mở lớp (CONFIRMED), Phụ huynh BẮT BUỘC phải thanh toán cọc trước 25% (Deposit) thông qua mã quét VietQR.\n" +
            "- 75% học phí còn lại (Final Payment) sẽ được Phụ huynh thanh toán nốt sau khi Gia sư dạy xong toàn bộ lộ trình.\n" +
            "- StudyHub đóng vai trò giữ tiền để đảm bảo quyền lợi (Escrow). Tiền chỉ được giải ngân (Disburse) cho gia sư sau khi lớp học hoàn thành (COMPLETED) và đã trừ phí nền tảng.\n\n" +
            "3. QUẢN LÝ LỚP HỌC (CLASS WORKSPACE):\n" +
            "- Mọi hoạt động dạy và học được quản lý trong 'Không gian lớp học'. Gia sư phải cung cấp Lộ trình (Syllabus) và Tài liệu học tập (Study Material) tại đây.\n\n" +
            "4. THÔNG TIN LIÊN HỆ:\n" +
            "- Hotline hỗ trợ CSKH khẩn cấp: 1900 8198.\n\n" +
            "YÊU CẦU TRẢ LỜI:\n" +
            "- Hãy xưng 'tôi' và gọi người dùng là 'bạn' hoặc 'Phụ huynh/Gia sư' tùy ngữ cảnh.\n" +
            "- Trả lời ngắn gọn, đúng trọng tâm câu hỏi. KHÔNG bịa đặt thông tin ngoài các luật trên.\n" +
            "- KHÔNG dùng định dạng markdown in đậm hoặc in nghiêng quá nhiều, chỉ dùng bullet points (-) hoặc số thứ tự, kết hợp Emoji thân thiện.";

    public String askChatbot(String userMessage) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String fullUrl = GEMINI_API_URL + geminiApiKey;

            // Xây dựng body cho Gemini API (v1beta)
            // { "contents": [ { "parts": [ {"text": "..."} ] } ] }
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", systemPrompt + "\n\nTin nhắn của phụ huynh/gia sư: " + userMessage);

            Map<String, Object> parts = new HashMap<>();
            parts.put("parts", List.of(textPart));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(parts));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(fullUrl, request, Map.class);
            Map<String, Object> body = response.getBody();

            if (body != null && body.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    if (content != null && content.containsKey("parts")) {
                        List<Map<String, Object>> resParts = (List<Map<String, Object>>) content.get("parts");
                        if (!resParts.isEmpty()) {
                            return (String) resParts.get(0).get("text");
                        }
                    }
                }
            }
            return "Xin lỗi, tôi đang gặp trục trặc kỹ thuật và không thể trả lời lúc này.";

        } catch (Exception e) {
            log.error("Lỗi khi gọi Gemini API: " + e.getMessage());
            return "Xin lỗi, lỗi hệ thống: " + e.getMessage();
        }
    }
}
