package com.management.studyhub.controller;

import com.management.studyhub.entity.User;
import com.management.studyhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(u -> ResponseEntity.ok(Map.of(
                        "id", u.getId(),
                        "email", u.getEmail(),
                        "fullName", u.getFullName() != null ? u.getFullName() : "",
                        "avatarUrl", u.getAvatarUrl() != null ? u.getAvatarUrl() : "",
                        "role", u.getRole().name(),
                        "createdAt", u.getCreatedAt().toString()
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return userRepository.findById(id).map(u -> {
            if (body.containsKey("fullName") && body.get("fullName") != null && !body.get("fullName").isBlank()) {
                u.setFullName(body.get("fullName"));
            }
            if (body.containsKey("avatarUrl") && body.get("avatarUrl") != null && !body.get("avatarUrl").isBlank()) {
                u.setAvatarUrl(body.get("avatarUrl"));
            }
            userRepository.save(u);
            return ResponseEntity.ok(Map.of(
                    "id", u.getId(),
                    "fullName", u.getFullName() != null ? u.getFullName() : "",
                    "avatarUrl", u.getAvatarUrl() != null ? u.getAvatarUrl() : "",
                    "message", "Cập nhật thành công"
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");

        if (oldPassword == null || newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Mật khẩu mới phải có ít nhất 6 ký tự"));
        }

        return userRepository.findById(id).map(u -> {
            if (!passwordEncoder.matches(oldPassword, u.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Mật khẩu hiện tại không đúng"));
            }
            u.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(u);
            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
