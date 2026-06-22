package com.management.studyhub.controller;

import com.management.studyhub.dto.ChatMessageDTO;
import com.management.studyhub.dto.ConversationDTO;
import com.management.studyhub.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(
            @RequestParam Long userId,
            @RequestParam String role) {
        try {
            return ResponseEntity.ok(chatService.getConversations(userId, role));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{classSessionId}")
    public ResponseEntity<List<ChatMessageDTO>> getMessages(@PathVariable Long classSessionId) {
        return ResponseEntity.ok(chatService.getMessages(classSessionId));
    }

    @PostMapping("/{classSessionId}")
    public ResponseEntity<?> sendMessage(
            @PathVariable Long classSessionId,
            @RequestBody Map<String, Object> payload) {
        try {
            Long senderId = Long.valueOf(payload.get("senderId").toString());
            String content = payload.get("messageContent").toString();
            return ResponseEntity.ok(chatService.sendMessage(classSessionId, senderId, content));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
