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

import jakarta.persistence.EntityManager;
import org.springframework.transaction.annotation.Transactional;

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
    private final EntityManager entityManager;

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

    @PostMapping("/clean-and-randomize")
    @Transactional
    public ResponseEntity<?> cleanAndRandomize() {
        try {
            // Find locked users
            List<User> lockedUsers = userRepository.findAll().stream()
                .filter(u -> "LOCKED".equals(u.getStatus()))
                .collect(Collectors.toList());
            int deletedCount = lockedUsers.size();
            for (User u : lockedUsers) {
                deleteUserNative(u.getId());
            }

            // Randomize join dates for all remaining users between June 1st and July 10th
            List<User> allUsers = userRepository.findAll();
            java.util.Random random = new java.util.Random();
            for (User u : allUsers) {
                int month = random.nextBoolean() ? 6 : 7;
                int day = (month == 6) ? (random.nextInt(30) + 1) : (random.nextInt(10) + 1);
                int hour = random.nextInt(24);
                int minute = random.nextInt(60);
                u.setCreatedAt(java.time.LocalDateTime.of(2026, month, day, hour, minute));
                userRepository.save(u);
            }

            // Clean all classes and transactions
            cleanAllClassesAndTransactions();

            return ResponseEntity.ok(Map.of(
                "message", "Cập nhật thành công!",
                "deletedCount", deletedCount,
                "remainingCount", allUsers.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    private void deleteUserNative(Long userId) {
        // Find tutor profile ID if any
        List<?> tutors = entityManager.createNativeQuery("SELECT id FROM tutor_profiles WHERE user_id = :userId")
            .setParameter("userId", userId)
            .getResultList();
        Long tutorProfileId = null;
        if (tutors != null && !tutors.isEmpty()) {
            Object obj = tutors.get(0);
            if (obj != null) {
                tutorProfileId = ((Number) obj).longValue();
            }
        }

        // Find parent ID if any
        List<?> parents = entityManager.createNativeQuery("SELECT id FROM parents WHERE user_id = :userId")
            .setParameter("userId", userId)
            .getResultList();
        Long parentId = null;
        if (parents != null && !parents.isEmpty()) {
            Object obj = parents.get(0);
            if (obj != null) {
                parentId = ((Number) obj).longValue();
            }
        }

        // Disable foreign key checks
        entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 0").executeUpdate();

        try {
            // Delete chat messages
            entityManager.createNativeQuery("DELETE FROM chat_messages WHERE sender_id = :userId").setParameter("userId", userId).executeUpdate();
            if (tutorProfileId != null) {
                entityManager.createNativeQuery("DELETE FROM chat_messages WHERE class_session_id IN (SELECT id FROM class_sessions WHERE tutor_profile_id = :tutorId)").setParameter("tutorId", tutorProfileId).executeUpdate();
            }
            if (parentId != null) {
                entityManager.createNativeQuery("DELETE FROM chat_messages WHERE class_session_id IN (SELECT id FROM class_sessions WHERE parent_id = :parentId)").setParameter("parentId", parentId).executeUpdate();
            }

            // Delete study materials
            entityManager.createNativeQuery("DELETE FROM study_materials WHERE uploader_id = :userId").setParameter("userId", userId).executeUpdate();
            if (tutorProfileId != null) {
                entityManager.createNativeQuery("DELETE FROM study_materials WHERE class_session_id IN (SELECT id FROM class_sessions WHERE tutor_profile_id = :tutorId)").setParameter("tutorId", tutorProfileId).executeUpdate();
            }
            if (parentId != null) {
                entityManager.createNativeQuery("DELETE FROM study_materials WHERE class_session_id IN (SELECT id FROM class_sessions WHERE parent_id = :parentId)").setParameter("parentId", parentId).executeUpdate();
            }

            // Delete lesson logs
            if (tutorProfileId != null) {
                entityManager.createNativeQuery("DELETE FROM lesson_logs WHERE class_session_id IN (SELECT id FROM class_sessions WHERE tutor_profile_id = :tutorId)").setParameter("tutorId", tutorProfileId).executeUpdate();
            }
            if (parentId != null) {
                entityManager.createNativeQuery("DELETE FROM lesson_logs WHERE class_session_id IN (SELECT id FROM class_sessions WHERE parent_id = :parentId)").setParameter("parentId", parentId).executeUpdate();
            }

            // Delete syllabus sessions
            if (tutorProfileId != null) {
                entityManager.createNativeQuery("DELETE FROM syllabus_sessions WHERE class_session_id IN (SELECT id FROM class_sessions WHERE tutor_profile_id = :tutorId)").setParameter("tutorId", tutorProfileId).executeUpdate();
            }
            if (parentId != null) {
                entityManager.createNativeQuery("DELETE FROM syllabus_sessions WHERE class_session_id IN (SELECT id FROM class_sessions WHERE parent_id = :parentId)").setParameter("parentId", parentId).executeUpdate();
            }

            // Delete parent feedbacks
            if (tutorProfileId != null) {
                entityManager.createNativeQuery("DELETE FROM parent_feedbacks WHERE class_id IN (SELECT id FROM class_sessions WHERE tutor_profile_id = :tutorId)").setParameter("tutorId", tutorProfileId).executeUpdate();
            }
            if (parentId != null) {
                entityManager.createNativeQuery("DELETE FROM parent_feedbacks WHERE class_id IN (SELECT id FROM class_sessions WHERE parent_id = :parentId)").setParameter("parentId", parentId).executeUpdate();
            }

            // Delete commission records
            if (tutorProfileId != null) {
                entityManager.createNativeQuery("DELETE FROM commission_records WHERE transaction_id IN (SELECT id FROM transactions WHERE class_session_id IN (SELECT id FROM class_sessions WHERE tutor_profile_id = :tutorId))").setParameter("tutorId", tutorProfileId).executeUpdate();
            }
            if (parentId != null) {
                entityManager.createNativeQuery("DELETE FROM commission_records WHERE transaction_id IN (SELECT id FROM transactions WHERE class_session_id IN (SELECT id FROM class_sessions WHERE parent_id = :parentId))").setParameter("parentId", parentId).executeUpdate();
            }

            // Delete transactions
            if (tutorProfileId != null) {
                entityManager.createNativeQuery("DELETE FROM transactions WHERE class_session_id IN (SELECT id FROM class_sessions WHERE tutor_profile_id = :tutorId)").setParameter("tutorId", tutorProfileId).executeUpdate();
            }
            if (parentId != null) {
                entityManager.createNativeQuery("DELETE FROM transactions WHERE class_session_id IN (SELECT id FROM class_sessions WHERE parent_id = :parentId)").setParameter("parentId", parentId).executeUpdate();
            }

            // Delete class sessions
            if (tutorProfileId != null) {
                entityManager.createNativeQuery("DELETE FROM class_sessions WHERE tutor_profile_id = :tutorId").setParameter("tutorId", tutorProfileId).executeUpdate();
            }
            if (parentId != null) {
                entityManager.createNativeQuery("DELETE FROM class_sessions WHERE parent_id = :parentId").setParameter("parentId", parentId).executeUpdate();
            }

            // Delete enrollments
            entityManager.createNativeQuery("DELETE FROM enrollments WHERE user_id = :userId").setParameter("userId", userId).executeUpdate();
            if (tutorProfileId != null) {
                entityManager.createNativeQuery("DELETE FROM enrollments WHERE course_id IN (SELECT id FROM courses WHERE tutor_id = :tutorId)").setParameter("tutorId", tutorProfileId).executeUpdate();
            }

            // Delete courses
            if (tutorProfileId != null) {
                entityManager.createNativeQuery("DELETE FROM courses WHERE tutor_id = :tutorId").setParameter("tutorId", tutorProfileId).executeUpdate();
            }

            // Delete direct bookings
            entityManager.createNativeQuery("DELETE FROM direct_bookings WHERE parent_id = :userId").setParameter("userId", userId).executeUpdate();
            if (tutorProfileId != null) {
                entityManager.createNativeQuery("DELETE FROM direct_bookings WHERE tutor_id = :tutorId").setParameter("tutorId", tutorProfileId).executeUpdate();
            }

            // Delete job postings & applicants
            if (parentId != null) {
                entityManager.createNativeQuery("DELETE FROM applicants WHERE job_posting_id IN (SELECT id FROM job_postings WHERE parent_id = :parentId)").setParameter("parentId", parentId).executeUpdate();
                entityManager.createNativeQuery("DELETE FROM job_postings WHERE parent_id = :parentId").setParameter("parentId", parentId).executeUpdate();
            }
            entityManager.createNativeQuery("DELETE FROM applicants WHERE tutor_id = :userIdStr").setParameter("userIdStr", String.valueOf(userId)).executeUpdate();

            // Delete tutor certificates, subjects, profile
            if (tutorProfileId != null) {
                entityManager.createNativeQuery("DELETE FROM tutor_certificates WHERE tutor_profile_id = :tutorId").setParameter("tutorId", tutorProfileId).executeUpdate();
                entityManager.createNativeQuery("DELETE FROM tutor_subjects WHERE tutor_profile_id = :tutorId").setParameter("tutorId", tutorProfileId).executeUpdate();
                entityManager.createNativeQuery("DELETE FROM tutor_profiles WHERE id = :tutorId").setParameter("tutorId", tutorProfileId).executeUpdate();
            }

            // Delete parent profile
            if (parentId != null) {
                entityManager.createNativeQuery("DELETE FROM parents WHERE id = :parentId").setParameter("parentId", parentId).executeUpdate();
            }

            // Delete user
            entityManager.createNativeQuery("DELETE FROM users WHERE id = :userId").setParameter("userId", userId).executeUpdate();

        } finally {
            // Re-enable foreign key checks
            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1").executeUpdate();
        }
    }

    private void cleanAllClassesAndTransactions() {
        entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 0").executeUpdate();
        try {
            entityManager.createNativeQuery("DELETE FROM commission_records").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM transactions").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM class_sessions").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM lesson_logs").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM syllabus_sessions").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM study_materials").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM chat_messages").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM parent_feedbacks").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM enrollments").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM courses").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM direct_bookings").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM applicants").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM job_postings").executeUpdate();
        } finally {
            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1").executeUpdate();
        }
    }
}
