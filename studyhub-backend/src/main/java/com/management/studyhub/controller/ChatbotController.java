package com.management.studyhub.controller;

import com.management.studyhub.dto.ChatbotDto;
import com.management.studyhub.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/ask")
    public ResponseEntity<ChatbotDto.ChatResponse> ask(@RequestBody ChatbotDto.ChatRequest request) {
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ChatbotDto.ChatResponse("Tin nhắn không hợp lệ."));
        }

        String reply = chatbotService.askChatbot(request.getMessage());
        return ResponseEntity.ok(new ChatbotDto.ChatResponse(reply));
    }
}
