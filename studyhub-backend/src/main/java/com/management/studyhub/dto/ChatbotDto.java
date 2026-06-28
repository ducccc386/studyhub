package com.management.studyhub.dto;

import lombok.Data;

public class ChatbotDto {

    @Data
    public static class ChatRequest {
        private String message;
    }

    @Data
    public static class ChatResponse {
        private String reply;

        public ChatResponse(String reply) {
            this.reply = reply;
        }
    }
}
