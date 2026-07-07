package com.management.studyhub.controller;

import com.management.studyhub.entity.User;
import com.management.studyhub.entity.TutorProfile;
import com.management.studyhub.entity.Parent;
import com.management.studyhub.repository.UserRepository;
import com.management.studyhub.repository.TutorProfileRepository;
import com.management.studyhub.repository.ParentRepository;
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
    private final TutorProfileRepository tutorProfileRepository;
    private final ParentRepository parentRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> allUsers = userRepository.findAll();

        // Prefetch tutor profiles and parents to map them by userId and avoid N+1
        Map<Long, TutorProfile> tutorProfileMap = new java.util.HashMap<>();
        try {
            List<TutorProfile> tutors = tutorProfileRepository.findAll();
            for (TutorProfile t : tutors) {
                try {
                    if (t.getUser() != null && t.getUser().getId() != null) {
                        tutorProfileMap.put(t.getUser().getId(), t);
                    }
                } catch (Exception ignored) {}
            }
        } catch (Exception ignored) {}

        Map<Long, Parent> parentMap = new java.util.HashMap<>();
        try {
            List<Parent> parents = parentRepository.findAll();
            for (Parent p : parents) {
                try {
                    if (p.getUser() != null && p.getUser().getId() != null) {
                        parentMap.put(p.getUser().getId(), p);
                    }
                } catch (Exception ignored) {}
            }
        } catch (Exception ignored) {}

        List<Map<String, Object>> users = allUsers.stream()
                .map(u -> {
                    Map<String, Object> map = new java.util.LinkedHashMap<>();
                    map.put("id", u.getId());
                    map.put("email", u.getEmail());
                    map.put("fullName", u.getFullName() != null ? u.getFullName() : "");
                    map.put("avatarUrl", u.getAvatarUrl() != null ? u.getAvatarUrl() : "");
                    
                    String roleName = u.getRole() != null ? u.getRole().name() : "";
                    map.put("role", roleName);

                    String phone = "";
                    String address = "";

                    if ("TUTOR".equals(roleName)) {
                        TutorProfile tutor = tutorProfileMap.get(u.getId());
                        if (tutor != null) {
                            phone = tutor.getPhoneNumber();
                            address = tutor.getAddress();
                        }
                    } else if ("PARENT".equals(roleName)) {
                        Parent parent = parentMap.get(u.getId());
                        if (parent != null) {
                            phone = parent.getPhone();
                        }
                    }

                    // Fallback to User table fields if profile details are empty
                    if (phone == null || phone.trim().isEmpty()) {
                        phone = u.getPhoneNumber() != null ? u.getPhoneNumber() : "";
                    }
                    if (address == null || address.trim().isEmpty()) {
                        address = u.getAddress() != null ? u.getAddress() : "";
                    }

                    map.put("phoneNumber", phone);
                    map.put("address", address);
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
