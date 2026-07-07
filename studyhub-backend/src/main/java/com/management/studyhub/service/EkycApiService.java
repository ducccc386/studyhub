package com.management.studyhub.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EkycApiService {

    @Value("${ekyc.facepp.api_key}")
    private String API_KEY;

    @Value("${ekyc.facepp.api_secret}")
    private String API_SECRET;

    private static final String FACEPP_COMPARE_URL = "https://api-us.faceplusplus.com/facepp/v3/compare";

    private final RestTemplate restTemplate = new RestTemplate();

    public BigDecimal compareFaces(String avatarUrl, String idCardUrl) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("api_key", API_KEY);
            body.add("api_secret", API_SECRET);
            
            if (avatarUrl != null && avatarUrl.startsWith("data:image/")) {
                String base64 = avatarUrl.substring(avatarUrl.indexOf(",") + 1);
                body.add("image_base64_1", base64);
            } else {
                body.add("image_url1", avatarUrl);
            }

            if (idCardUrl != null && idCardUrl.startsWith("data:image/")) {
                String base64 = idCardUrl.substring(idCardUrl.indexOf(",") + 1);
                body.add("image_base64_2", base64);
            } else {
                body.add("image_url2", idCardUrl);
            }

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);

            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(FACEPP_COMPARE_URL, requestEntity, (Class<Map<String, Object>>)(Class<?>)Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                if (responseBody.containsKey("confidence")) {
                    Object confidenceObj = responseBody.get("confidence");
                    if (confidenceObj instanceof Number) {
                        return BigDecimal.valueOf(((Number) confidenceObj).doubleValue());
                    } else if (confidenceObj instanceof String) {
                        return new BigDecimal((String) confidenceObj);
                    }
                } else if (responseBody.containsKey("error_message")) {
                    String errorMsg = (String) responseBody.get("error_message");
                    log.error("Face++ API Error: {}", errorMsg);
                    throw new RuntimeException("Face++ API Error: " + errorMsg);
                }
            }
            return null;

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error calling Face++ API: ", e);
            throw new RuntimeException("Lỗi kết nối đến dịch vụ eKYC.");
        }
    }
}
