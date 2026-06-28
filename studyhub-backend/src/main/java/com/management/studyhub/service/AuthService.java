package com.management.studyhub.service;

import com.management.studyhub.dto.AuthRequestDTO;
import com.management.studyhub.dto.AuthResponseDTO;
import com.management.studyhub.dto.RegisterDTO;
import com.management.studyhub.entity.User;
import com.management.studyhub.entity.enums.UserRole;
import com.management.studyhub.repository.UserRepository;
import com.management.studyhub.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.management.studyhub.entity.TutorProfile;
import com.management.studyhub.entity.enums.EkycStatus;
import com.management.studyhub.entity.enums.TutorStatus;
import com.management.studyhub.repository.TutorProfileRepository;
import com.management.studyhub.entity.Parent;
import com.management.studyhub.repository.ParentRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Collections;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.management.studyhub.dto.GoogleLoginRequestDTO;
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final ParentRepository parentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${google.client.id}")
    private String googleClientId;

    public AuthResponseDTO googleLogin(GoogleLoginRequestDTO request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getCredential());
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String name = (String) payload.get("name");
                String pictureUrl = (String) payload.get("picture");

                Optional<User> userOpt = userRepository.findByEmail(email);
                User user;
                Long tutorId = null;

                if (userOpt.isPresent()) {
                    user = userOpt.get();
                    if (user.getRole() == UserRole.TUTOR) {
                        tutorId = tutorProfileRepository.findByUserId(user.getId())
                                .map(TutorProfile::getId).orElse(null);
                    }
                } else {
                    if (request.getRole() == null || request.getRole().isEmpty()) {
                        throw new RuntimeException("NEW_GOOGLE_USER");
                    }
                    UserRole selectedRole;
                    try {
                        selectedRole = UserRole.valueOf(request.getRole().toUpperCase());
                    } catch (Exception e) {
                        selectedRole = UserRole.PARENT;
                    }

                    user = new User();
                    user.setEmail(email);
                    user.setFullName(name);
                    user.setAvatarUrl(pictureUrl);
                    user.setRole(selectedRole);
                    user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                    user = userRepository.save(user);

                    if (selectedRole == UserRole.TUTOR) {
                        TutorProfile tutorProfile = new TutorProfile();
                        tutorProfile.setUser(user);
                        tutorProfile.setFullName(user.getFullName());
                        tutorProfile.setEkycStatus(EkycStatus.NOT_STARTED);
                        tutorProfile.setStatus(TutorStatus.PENDING);
                        tutorProfileRepository.save(tutorProfile);
                        tutorId = tutorProfile.getId();
                    } else if (selectedRole == UserRole.PARENT) {
                        Parent parent = new Parent();
                        parent.setUser(user);
                        parent.setName(user.getFullName());
                        parent.setEmail(user.getEmail());
                        parent.setAvatar(user.getAvatarUrl());
                        parent.setBudgetSpentThisMonth(0.0);
                        parent.setClassesWaiting(0);
                        parentRepository.save(parent);
                    }
                }

                String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
                return new AuthResponseDTO(token, user.getRole(), user.getEmail(), user.getFullName(), user.getAvatarUrl(), tutorId, user.getId());

            } else {
                throw new RuntimeException("Invalid ID token.");
            }
        } catch (Exception e) {
            throw new RuntimeException("Google login failed: " + e.getMessage());
        }
    }

    public AuthResponseDTO login(AuthRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        Long tutorId = null;
        if (user.getRole() == UserRole.TUTOR) {
            Optional<TutorProfile> profileOpt = tutorProfileRepository.findByUserId(user.getId());
            if (profileOpt.isPresent()) {
                tutorId = profileOpt.get().getId();
            }
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponseDTO(token, user.getRole(), user.getEmail(), user.getFullName(), user.getAvatarUrl(), tutorId, user.getId());
    }

    public AuthResponseDTO register(RegisterDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        UserRole role;
        try {
            role = UserRole.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            role = UserRole.PARENT; // Default fallback
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setFullName(request.getFullName());
        
        userRepository.save(user);

        Long tutorId = null;
        if (role == UserRole.TUTOR) {
            TutorProfile tutorProfile = new TutorProfile();
            tutorProfile.setUser(user);
            tutorProfile.setFullName(user.getFullName());
            tutorProfile.setEkycStatus(EkycStatus.NOT_STARTED);
            tutorProfile.setStatus(TutorStatus.PENDING);
            tutorProfileRepository.save(tutorProfile);
            tutorId = tutorProfile.getId();
        } else if (role == UserRole.PARENT) {
            Parent parent = new Parent();
            parent.setUser(user);
            parent.setName(user.getFullName());
            parent.setEmail(user.getEmail());
            parent.setAvatar(user.getAvatarUrl());
            parent.setBudgetSpentThisMonth(0.0);
            parent.setClassesWaiting(0);
            parentRepository.save(parent);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponseDTO(token, user.getRole(), user.getEmail(), user.getFullName(), user.getAvatarUrl(), tutorId, user.getId());
    }
}
