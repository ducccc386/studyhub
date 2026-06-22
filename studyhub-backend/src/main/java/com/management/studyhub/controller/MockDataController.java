package com.management.studyhub.controller;

import com.management.studyhub.entity.Subject;
import com.management.studyhub.entity.TutorProfile;
import com.management.studyhub.entity.User;
import com.management.studyhub.entity.enums.TutorStatus;
import com.management.studyhub.entity.enums.UserRole;
import com.management.studyhub.repository.SubjectRepository;
import com.management.studyhub.repository.TutorProfileRepository;
import com.management.studyhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

// Chỉ chạy trong môi trường dev — KHÔNG bao giờ deploy controller này lên production
@Profile("dev")
@RestController
@RequestMapping("/api/v1/mock")
@RequiredArgsConstructor
public class MockDataController {

    private final UserRepository userRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final SubjectRepository subjectRepository;
    private final com.management.studyhub.repository.ClassSessionRepository classSessionRepository;
    private final com.management.studyhub.repository.ParentRepository parentRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/make-all-trial")
    @Transactional
    public ResponseEntity<String> makeAllTrial() {
        classSessionRepository.findAll().forEach(c -> {
            c.setStatus(com.management.studyhub.entity.enums.ClassSessionStatus.TRIAL);
            classSessionRepository.save(c);
        });
        return ResponseEntity.ok("Thành công! Toàn bộ các lớp học hiện tại đã được chuyển sang trạng thái Đang học thử (TRIAL). Bạn có thể quay lại trang web và F5 để test thanh toán.");
    }

    @PostMapping("/init")
    @Transactional
    public ResponseEntity<String> initMockData() {
        // 1. Tạo Subjects nếu chưa có
        List<String> subjectNames = List.of("Toán học", "Vật lý", "Hóa học", "Tiếng Anh", "Tin học");
        List<Subject> subjects = new ArrayList<>();
        
        List<Subject> existing = subjectRepository.findAll();
        for (String name : subjectNames) {
            Subject subject = existing.stream().filter(s -> {
                String normalized = s.getName().trim().toLowerCase();
                normalized = normalized.replace("lí", "lý").replace("hoá", "hóa");
                return normalized.equals(name.toLowerCase());
            }).findFirst().orElse(null);
            
            if (subject == null) {
                subject = new Subject();
                subject.setName(name);
                subject = subjectRepository.save(subject);
            }
            subjects.add(subject);
        }

        // 2. Tạo Tutors
        createMockTutor(
            "tutor1@test.com", "Nguyễn Thu Hà", "Sư phạm Toán - ĐH Sư Phạm HN", "Sư phạm Toán", 
            "Chuyên luyện thi Đại học khối A, A1 với hơn 5 năm kinh nghiệm. Phương pháp dạy tư duy mới giúp học sinh nắm vững bản chất...",
            250000.0, "ONLINE", 4.9, 42, Set.of(subjects.get(0), subjects.get(1))
        );

        createMockTutor(
            "tutor2@test.com", "Trần Minh Hoàng", "ĐH Ngoại Thương", "Ngôn ngữ Anh", 
            "Chuyên luyện thi IELTS Speaking & Writing. Cam kết đầu ra 6.5+ cho học sinh mất gốc.",
            400000.0, "BOTH", 5.0, 28, Set.of(subjects.get(3))
        );

        createMockTutor(
            "tutor3@test.com", "Lê Kim Chi", "ĐHQG TP.HCM", "Vật lý học", 
            "Giải thích các hiện tượng vật lý khó hiểu một cách đơn giản nhất thông qua thực hành và ví dụ thực tế...",
            300000.0, "OFFLINE", 4.8, 19, Set.of(subjects.get(1))
        );

        createMockTutor(
            "tutor4@test.com", "Phạm Quốc Bảo", "ĐH Bách Khoa", "Kỹ thuật phần mềm", 
            "Hướng dẫn lập trình từ cơ bản đến nâng cao (Python, C++, Java). Hỗ trợ làm đồ án và giải các bài tập chuyên sâu...",
            350000.0, "ONLINE", 4.7, 35, Set.of(subjects.get(4), subjects.get(0))
        );
        
        createMockTutor(
            "tutor5@test.com", "Vũ Lan Phương", "ĐH Khoa Học Tự Nhiên", "Hóa học phân tích", 
            "Bồi dưỡng học sinh giỏi Hóa cấp THCS và THPT. Dạy sát chương trình SGK mới.",
            200000.0, "OFFLINE", 4.5, 12, Set.of(subjects.get(2))
        );

        return ResponseEntity.ok("Tạo dữ liệu mock thành công!");
    }

    private void createMockTutor(String email, String name, String uni, String major, String intro, 
                                 Double price, String method, Double rating, int reviews, Set<Subject> subjects) {
        
        // Check if user exists
        if (tutorProfileRepository.findAll().stream().anyMatch(t -> t.getFullName().equals(name))) {
            return;
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole(UserRole.TUTOR);
        user = userRepository.save(user);

        TutorProfile tutor = new TutorProfile();
        tutor.setUser(user);
        tutor.setFullName(name);
        tutor.setUniversityName(uni);
        tutor.setMajor(major);
        tutor.setIntroduction(intro);
        tutor.setPrice(price);
        tutor.setTeachingMethod(method);
        tutor.setAverageRating(rating);
        tutor.setTotalReviews(reviews);
        tutor.setStatus(TutorStatus.APPROVED);
        tutor.setDeleted(false);
        tutor.setBirthDate(LocalDate.of(1995, 5, 20));
        tutor.setExperienceYears(3);
        
        // Dummy Avatar
        tutor.setAvatarUrl("https://ui-avatars.com/api/?name=" + name.replace(" ", "+") + "&background=003d9b&color=fff");

        // Subjects
        tutor.setSubjects(new HashSet<>(subjects));

        tutorProfileRepository.save(tutor);
    }

    @PostMapping("/payment-test-data")
    @Transactional
    public ResponseEntity<String> initPaymentTestData() {
        // Tạo vài ClassSession để test luồng payment
        com.management.studyhub.entity.ClassSession trialClass = new com.management.studyhub.entity.ClassSession();
        trialClass.setClassName("Lớp Toán Hình Học 12");
        trialClass.setTutorName("Nguyễn Thu Hà");
        trialClass.setStatus(com.management.studyhub.entity.enums.ClassSessionStatus.TRIAL);
        trialClass.setPrice(2000000.0);
        classSessionRepository.save(trialClass);

        com.management.studyhub.entity.ClassSession completedClass = new com.management.studyhub.entity.ClassSession();
        completedClass.setClassName("Lớp Tiếng Anh Giao Tiếp");
        completedClass.setTutorName("Mr. David Smith");
        completedClass.setStatus(com.management.studyhub.entity.enums.ClassSessionStatus.COMPLETED);
        completedClass.setPrice(4500000.0);
        classSessionRepository.save(completedClass);

        return ResponseEntity.ok("Đã tạo dữ liệu giả cho ClassSession để test Payment. \n- Lớp TRIAL id: " + trialClass.getId() + "\n- Lớp COMPLETED id: " + completedClass.getId());
    }

    @PostMapping("/fix")
    @Transactional
    public ResponseEntity<String> fixMockData() {
        // Delete mock tutors and users
        tutorProfileRepository.deleteAll();
        userRepository.deleteAll(userRepository.findAll().stream().filter(u -> u.getRole() == UserRole.TUTOR).toList());
        
        // Find existing valid subjects (id 1 to 5) or unique by name
        List<Subject> allSubjects = subjectRepository.findAll();
        Set<String> seenNames = new HashSet<>();
        List<Subject> duplicates = new ArrayList<>();
        
        for (Subject s : allSubjects) {
            String normalized = s.getName().trim().toLowerCase();
            // Coerce "lí" and "lý", "hoá" and "hóa"
            normalized = normalized.replace("lí", "lý").replace("hoá", "hóa");
            if (seenNames.contains(normalized)) {
                duplicates.add(s);
            } else {
                seenNames.add(normalized);
            }
        }
        
        subjectRepository.deleteAll(duplicates);

        return ResponseEntity.ok("Đã dọn dẹp các môn học bị trùng lặp và xóa các gia sư mock. Bạn hãy ấn nút 'Khởi tạo Mock Data' (gọi lại API /init) một lần nữa nhé.");
    }
}
