package com.management.studyhub.controller;

import com.management.studyhub.entity.User;
import com.management.studyhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> {
                    Map<String, Object> map = new java.util.LinkedHashMap<>();
                    map.put("id", u.getId());
                    map.put("email", u.getEmail());
                    map.put("fullName", u.getFullName() != null ? u.getFullName() : "");
                    map.put("avatarUrl", u.getAvatarUrl() != null ? u.getAvatarUrl() : "");
                    map.put("role", u.getRole().name());
                    map.put("phoneNumber", u.getPhoneNumber() != null ? u.getPhoneNumber() : "");
                    map.put("address", u.getAddress() != null ? u.getAddress() : "");
                    map.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : "");
                    map.put("status", u.getStatus() != null ? u.getStatus() : "ACTIVE");
                    return map;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/lock")
    public ResponseEntity<?> lockUser(@PathVariable Long id) {
        return userRepository.findById(id).map(u -> {
            u.setStatus("LOCKED");
            userRepository.save(u);
            return ResponseEntity.ok(Map.of("message", "Đã khóa tài khoản"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/unlock")
    public ResponseEntity<?> unlockUser(@PathVariable Long id) {
        return userRepository.findById(id).map(u -> {
            u.setStatus("ACTIVE");
            userRepository.save(u);
            return ResponseEntity.ok(Map.of("message", "Đã mở khóa tài khoản"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
