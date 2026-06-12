package com.management.studyhub.config;

import com.management.studyhub.entity.*;
import com.management.studyhub.entity.enums.*;
import com.management.studyhub.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * DataInitializer — Tự động seed dữ liệu mẫu khi chạy lần đầu.
 *
 * Điều kiện: Chỉ chạy nếu bảng users RỖNG (tránh duplicate data).
 *
 * Tài khoản mẫu:
 *   Admin  : admin@studyhub.vn        / Admin@123
 *   Parent : nguyenthimai@gmail.com   / Parent@123
 *   Parent : tranthihuong@gmail.com   / Parent@123
 *   Tutor  : tutorminh@gmail.com      / Tutor@123   (eKYC = SUCCESS)
 *   Tutor  : tutorlinhchi@gmail.com   / Tutor@123   (eKYC = SUCCESS)
 *   Tutor  : tutorhung@gmail.com      / Tutor@123   (eKYC = PROCESSING)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final ParentRepository parentRepository;
    private final JobPostingRepository jobPostingRepository;
    private final TestimonialRepository testimonialRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) {
        log.info("✅ DataInitializer: Disabled for production deployment.");
        if (true) return;
        
        if (userRepository.count() > 0) {
            log.info("✅ DataInitializer: Database already has data. Skipping seed.");
            return;
        }

        log.info("🌱 DataInitializer: Seeding initial data...");

        // ──────────────────────────────────────────
        // 1. Subjects (Môn học)
        // ──────────────────────────────────────────
        List<String> subjectNames = Arrays.asList(
            "Toán học", "Ngữ văn", "Tiếng Anh", "Vật lý",
            "Hóa học", "Sinh học", "Lịch sử", "Địa lý",
            "Tin học", "Tiếng Nhật", "Tiếng Trung", "Âm nhạc"
        );
        List<Subject> subjects = subjectNames.stream().map(name -> {
            Subject s = new Subject();
            s.setName(name);
            return subjectRepository.save(s);
        }).toList();
        log.info("✅ Seeded {} subjects", subjects.size());

        // ──────────────────────────────────────────
        // 2. Admin User
        // ──────────────────────────────────────────
        User adminUser = createUser("admin@studyhub.vn", "Admin@123", UserRole.ADMIN, "StudyHub Admin", null);
        log.info("✅ Seeded admin: admin@studyhub.vn / Admin@123");

        // ──────────────────────────────────────────
        // 3. Parent Users
        // ──────────────────────────────────────────
        User parentUser1 = createUser("nguyenthimai@gmail.com", "Parent@123", UserRole.PARENT,
            "Nguyễn Thị Mai",
            "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=200");
        User parentUser2 = createUser("tranthihuong@gmail.com", "Parent@123", UserRole.PARENT,
            "Trần Thị Hương",
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200");

        Parent parent1 = createParent(parentUser1, "Nguyễn Thị Mai", "nguyenthimai@gmail.com", "0912345678");
        Parent parent2 = createParent(parentUser2, "Trần Thị Hương", "tranthihuong@gmail.com", "0987654321");
        log.info("✅ Seeded 2 parents");

        // ──────────────────────────────────────────
        // 4. Tutor Users + Profiles
        // ──────────────────────────────────────────
        User tutorUser1 = createUser("tutorminh@gmail.com", "Tutor@123", UserRole.TUTOR,
            "Nguyễn Văn Minh",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300");
        User tutorUser2 = createUser("tutorlinhchi@gmail.com", "Tutor@123", UserRole.TUTOR,
            "Đặng Thị Linh Chi",
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300");
        User tutorUser3 = createUser("tutorhung@gmail.com", "Tutor@123", UserRole.TUTOR,
            "Phạm Văn Hùng",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300");

        TutorProfile tutor1 = createTutorProfile(
            tutorUser1, "Nguyễn Văn Minh",
            "Đại học Bách Khoa Hà Nội", "Sư phạm Toán - Lý", 3,
            EkycStatus.SUCCESS, TutorStatus.APPROVED,
            "Gia sư Toán-Lý nhiều kinh nghiệm, từng dạy thêm tại nhiều trung tâm uy tín. " +
            "Phương pháp dạy dễ hiểu, kiên nhẫn với học sinh yếu.",
            300000.0, "ONLINE",
            Set.of(subjects.get(0), subjects.get(3)), // Toán, Vật lý
            4.8, 32
        );

        TutorProfile tutor2 = createTutorProfile(
            tutorUser2, "Đặng Thị Linh Chi",
            "Đại học Ngoại Thương Hà Nội", "Ngôn ngữ Anh", 2,
            EkycStatus.SUCCESS, TutorStatus.APPROVED,
            "Cựu sinh viên xuất sắc khoa Anh, IELTS 8.0. Dạy Tiếng Anh cho mọi lứa tuổi, " +
            "từ cơ bản đến luyện thi IELTS/TOEIC.",
            250000.0, "BOTH",
            Set.of(subjects.get(2)), // Tiếng Anh
            4.9, 58
        );

        TutorProfile tutor3 = createTutorProfile(
            tutorUser3, "Phạm Văn Hùng",
            "Đại học Sư Phạm Hà Nội", "Sư phạm Hóa học", 1,
            EkycStatus.PROCESSING, TutorStatus.PENDING,
            "Sinh viên năm 4 ngành Sư phạm Hóa học. Có kinh nghiệm gia sư 1 năm.",
            150000.0, "OFFLINE",
            Set.of(subjects.get(4), subjects.get(5)), // Hóa, Sinh
            0.0, 0
        );
        log.info("✅ Seeded 3 tutor profiles");

        // ──────────────────────────────────────────
        // 5. Job Postings (Bài đăng tuyển gia sư)
        // ──────────────────────────────────────────
        createJobPosting(parent1,
            "Tìm gia sư Toán lớp 9 tại Cầu Giấy",
            "Toán học", "Lớp 9",
            "Con tôi đang chuẩn bị thi vào lớp 10. Cần gia sư Toán lớp 9 dạy buổi tối. " +
            "Yêu cầu có kinh nghiệm luyện thi tuyển sinh.",
            "RECRUITING", "Cầu Giấy, Hà Nội",
            "Thứ 2, Thứ 4, Thứ 6 - 19:00",
            200000.0, "OFFLINE", "ANY"
        );

        createJobPosting(parent1,
            "Cần gia sư Tiếng Anh online cho bé lớp 6",
            "Tiếng Anh", "Lớp 6",
            "Cần gia sư dạy Tiếng Anh online cho bé gái lớp 6. " +
            "Mục tiêu nâng cao kỹ năng nói và viết. Ưu tiên IELTS >= 7.0.",
            "RECRUITING", "Online",
            "Thứ 3, Thứ 5 - 20:00",
            180000.0, "ONLINE", "FEMALE"
        );

        createJobPosting(parent2,
            "Tìm gia sư Hóa học lớp 11",
            "Hóa học", "Lớp 11",
            "Con học lớp 11 ban Khoa học Tự nhiên, cần gia sư Hóa giỏi luyện đề. " +
            "Nhà ở Đống Đa, có thể dạy online hoặc tại nhà.",
            "RECRUITING", "Đống Đa, Hà Nội",
            "Thứ 7, Chủ nhật - 09:00",
            220000.0, "BOTH", "ANY"
        );
        log.info("✅ Seeded 3 job postings");

        // ──────────────────────────────────────────
        // 6. Testimonials (Đánh giá trang chủ)
        // ──────────────────────────────────────────
        createTestimonial("Nguyễn Thị Mai", parentUser1.getAvatarUrl(),
            "StudyHub giúp tôi tìm được gia sư Toán tuyệt vời cho con trong vòng 2 ngày. " +
            "Quy trình xác minh eKYC rất đáng tin cậy!",
            5, "Phụ huynh");

        createTestimonial("Nguyễn Văn Minh", tutorUser1.getAvatarUrl(),
            "Là gia sư, tôi rất thích nền tảng này. Tìm học sinh dễ dàng, thanh toán minh bạch. " +
            "Đã nhận được hơn 30 lớp qua StudyHub!",
            5, "Gia sư");

        createTestimonial("Trần Thị Hương", parentUser2.getAvatarUrl(),
            "Giao diện rất dễ dùng. Con tôi bây giờ học Tiếng Anh cùng cô Linh Chi và tiến bộ rõ rệt. " +
            "Cảm ơn StudyHub!",
            5, "Phụ huynh");
        log.info("✅ Seeded 3 testimonials");

        log.info("🎉 DataInitializer: Seed completed successfully!");
        log.info("📋 Test accounts:");
        log.info("   ADMIN  : admin@studyhub.vn / Admin@123");
        log.info("   PARENT : nguyenthimai@gmail.com / Parent@123");
        log.info("   PARENT : tranthihuong@gmail.com / Parent@123");
        log.info("   TUTOR  : tutorminh@gmail.com / Tutor@123 (eKYC: SUCCESS)");
        log.info("   TUTOR  : tutorlinhchi@gmail.com / Tutor@123 (eKYC: SUCCESS)");
        log.info("   TUTOR  : tutorhung@gmail.com / Tutor@123 (eKYC: PROCESSING)");
    }

    // ──────────────────────────────────────────
    // Helper methods
    // ──────────────────────────────────────────

    private User createUser(String email, String rawPassword, UserRole role, String fullName, String avatarUrl) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setFullName(fullName);
        user.setAvatarUrl(avatarUrl);
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    private Parent createParent(User user, String name, String email, String phone) {
        Parent parent = new Parent();
        parent.setUser(user);
        parent.setName(name);
        parent.setEmail(email);
        parent.setPhone(phone);
        parent.setAvatar(user.getAvatarUrl());
        parent.setBudgetSpentThisMonth(0.0);
        parent.setClassesWaiting(0);
        return parentRepository.save(parent);
    }

    private TutorProfile createTutorProfile(
        User user, String fullName, String university, String major, int expYears,
        EkycStatus ekycStatus, TutorStatus status,
        String introduction, Double price, String teachingMethod,
        Set<Subject> subjects, Double avgRating, Integer totalReviews
    ) {
        TutorProfile profile = new TutorProfile();
        profile.setUser(user);
        profile.setFullName(fullName);
        profile.setAvatarUrl(user.getAvatarUrl());
        profile.setUniversityName(university);
        profile.setMajor(major);
        profile.setExperienceYears(expYears);
        profile.setEkycStatus(ekycStatus);
        profile.setStatus(status);
        profile.setIntroduction(introduction);
        profile.setPrice(price);
        profile.setTeachingMethod(teachingMethod);
        profile.setSubjects(subjects);
        profile.setAverageRating(avgRating);
        profile.setTotalReviews(totalReviews);
        profile.setDeleted(false);
        profile.setBirthDate(LocalDate.of(1998, 5, 15));
        profile.setAddress("Hà Nội");
        profile.setPhoneNumber("0900000000");
        if (ekycStatus == EkycStatus.SUCCESS) {
            profile.setSimilarityScore(new BigDecimal("92.5"));
        }
        return tutorProfileRepository.save(profile);
    }

    private void createJobPosting(
        Parent parent, String title, String subject, String classLevel,
        String description, String status, String location,
        String schedule, Double pricePerSession, String learningMode, String genderPref
    ) {
        JobPosting jp = new JobPosting();
        jp.setParent(parent);
        jp.setTitle(title);
        jp.setSubject(subject);
        jp.setClassLevel(classLevel);
        jp.setDescription(description);
        jp.setPostedAt(LocalDateTime.now().minusDays((long)(Math.random() * 5)));
        jp.setStatus(status);
        jp.setLocation(location);
        jp.setDetailedAddress(location);
        jp.setSchedule(schedule);
        jp.setPricePerSession(pricePerSession);
        jp.setLearningMode(learningMode);
        jp.setTutorGenderPreference(genderPref);
        jp.setApplicantsCount(0);
        jp.setRequirement("Có kinh nghiệm dạy kèm ít nhất 6 tháng. Kiên nhẫn, nhiệt tình với học sinh.");
        jobPostingRepository.save(jp);
    }

    private void createTestimonial(String name, String avatar, String content, int rating, String userRole) {
        Testimonial t = new Testimonial();
        t.setName(name);
        t.setAvatar(avatar);
        t.setQuote(content);
        t.setStars(rating);
        t.setRole(userRole);
        t.setCreatedAt(LocalDateTime.now());
        testimonialRepository.save(t);
    }
}
