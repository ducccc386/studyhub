package com.management.studyhub.service;

import com.management.studyhub.dto.ChatMessageDTO;
import com.management.studyhub.dto.ConversationDTO;
import com.management.studyhub.entity.ChatMessage;
import com.management.studyhub.entity.ClassSession;
import com.management.studyhub.entity.Parent;
import com.management.studyhub.entity.TutorProfile;
import com.management.studyhub.entity.User;
import com.management.studyhub.repository.ChatMessageRepository;
import com.management.studyhub.repository.ClassSessionRepository;
import com.management.studyhub.repository.ParentRepository;
import com.management.studyhub.repository.TutorProfileRepository;
import com.management.studyhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final ClassSessionRepository classSessionRepository;
    private final ParentRepository parentRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final UserRepository userRepository;

    private Parent getOrCreateParent(Long userId) {
        return parentRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
            Parent newParent = new Parent();
            newParent.setUser(user);
            newParent.setName(user.getFullName());
            newParent.setEmail(user.getEmail());
            newParent.setAvatar(user.getAvatarUrl());
            newParent.setBudgetSpentThisMonth(0.0);
            newParent.setClassesWaiting(0);
            return parentRepository.save(newParent);
        });
    }

    public List<ConversationDTO> getConversations(Long userId, String role) {
        List<ClassSession> sessions;
        if ("PARENT".equalsIgnoreCase(role)) {
            Parent parent = getOrCreateParent(userId);
            sessions = classSessionRepository.findByParentId(parent.getId());
        } else if ("TUTOR".equalsIgnoreCase(role)) {
            TutorProfile tutor = tutorProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Tutor not found"));
            sessions = classSessionRepository.findByTutorProfileId(tutor.getId());
        } else {
            throw new RuntimeException("Invalid role");
        }

        List<ConversationDTO> conversations = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");

        for (ClassSession session : sessions) {
            ConversationDTO dto = new ConversationDTO();
            dto.setClassSessionId(session.getId());
            dto.setClassName(session.getClassName());
            dto.setOnline(false);
            dto.setUnreadCount(0); // Sẽ xử lý thật sau nếu có thời gian

            if ("PARENT".equalsIgnoreCase(role)) {
                // Partner là Tutor
                dto.setPartnerId(null); // Chúng ta có thể lấy userId của tutor nếu cần, nhưng frontend chủ yếu cần thông tin hiển thị
                dto.setPartnerName(session.getTutorName());
                dto.setPartnerAvatar(session.getTutorAvatar());
                dto.setPartnerRole("Tutor");
            } else {
                // Partner là Parent
                if (session.getParent() != null && session.getParent().getUser() != null) {
                    dto.setPartnerId(session.getParent().getUser().getId());
                }
                dto.setPartnerName(session.getParentName());
                dto.setPartnerAvatar(session.getParent() != null ? session.getParent().getAvatar() : null);
                dto.setPartnerRole("Parent");
            }

            ChatMessage lastMsg = chatMessageRepository.findTopByClassSessionIdOrderBySentAtDesc(session.getId());
            if (lastMsg != null) {
                dto.setLastMessage(lastMsg.getMessageContent());
                dto.setLastMessageTime(lastMsg.getSentAt().format(formatter));
            } else {
                dto.setLastMessage("Chưa có tin nhắn nào");
                dto.setLastMessageTime("");
            }

            conversations.add(dto);
        }

        return conversations;
    }

    public List<ChatMessageDTO> getMessages(Long classSessionId) {
        return chatMessageRepository.findByClassSessionIdOrderBySentAtAsc(classSessionId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public ChatMessageDTO sendMessage(Long classSessionId, Long senderId, String messageContent) {
        ClassSession session = classSessionRepository.findById(classSessionId)
                .orElseThrow(() -> new RuntimeException("ClassSession not found"));
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        ChatMessage msg = new ChatMessage();
        msg.setClassSession(session);
        msg.setSender(sender);
        msg.setMessageContent(messageContent);
        
        ChatMessage saved = chatMessageRepository.save(msg);
        return mapToDTO(saved);
    }

    private ChatMessageDTO mapToDTO(ChatMessage msg) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setId(msg.getId());
        dto.setClassSessionId(msg.getClassSession().getId());
        dto.setSenderId(msg.getSender().getId());
        dto.setSenderName(msg.getSender().getFullName());
        dto.setSenderRole(msg.getSender().getRole().name());
        dto.setMessageContent(msg.getMessageContent());
        dto.setSentAt(msg.getSentAt());
        dto.setRead(msg.isRead());
        return dto;
    }
}
