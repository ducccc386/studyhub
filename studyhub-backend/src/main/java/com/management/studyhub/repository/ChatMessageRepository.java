package com.management.studyhub.repository;

import com.management.studyhub.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByClassSessionIdOrderBySentAtAsc(Long classSessionId);
    
    // Tìm tin nhắn cuối cùng của 1 class session
    ChatMessage findTopByClassSessionIdOrderBySentAtDesc(Long classSessionId);
}
