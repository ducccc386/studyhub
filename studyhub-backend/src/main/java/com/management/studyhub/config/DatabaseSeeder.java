package com.management.studyhub.config;

import com.management.studyhub.entity.Applicant;
import com.management.studyhub.entity.ClassSession;
import com.management.studyhub.entity.Course;
import com.management.studyhub.entity.DirectBooking;
import com.management.studyhub.entity.JobPosting;
import com.management.studyhub.entity.Parent;
import com.management.studyhub.entity.Subject;
import com.management.studyhub.entity.Testimonial;
import com.management.studyhub.entity.TutorProfile;
import com.management.studyhub.entity.User;
import com.management.studyhub.entity.enums.ClassSessionStatus;
import com.management.studyhub.entity.enums.EkycStatus;
import com.management.studyhub.entity.enums.TutorStatus;
import com.management.studyhub.entity.enums.UserRole;
import com.management.studyhub.repository.ApplicantRepository;
import com.management.studyhub.repository.ClassSessionRepository;
import com.management.studyhub.repository.CourseRepository;
import com.management.studyhub.repository.DirectBookingRepository;
import com.management.studyhub.repository.JobPostingRepository;
import com.management.studyhub.repository.ParentRepository;
import com.management.studyhub.repository.SubjectRepository;
import com.management.studyhub.repository.TestimonialRepository;
import com.management.studyhub.repository.TutorProfileRepository;
import com.management.studyhub.repository.UserRepository;
import com.management.studyhub.entity.LessonLog;
import com.management.studyhub.repository.LessonLogRepository;
import com.management.studyhub.entity.PublicDocument;
import com.management.studyhub.repository.PublicDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final TutorProfileRepository tutorProfileRepository;
    private final CourseRepository courseRepository;
    private final TestimonialRepository testimonialRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final ParentRepository parentRepository;
    private final JobPostingRepository jobPostingRepository;
    private final PasswordEncoder passwordEncoder;
    private final ClassSessionRepository classSessionRepository;
    private final DirectBookingRepository directBookingRepository;
    private final ApplicantRepository applicantRepository;
    private final LessonLogRepository lessonLogRepository;
    private final PublicDocumentRepository publicDocumentRepository;

    @Override
    public void run(String... args) throws Exception {
        if (subjectRepository.count() == 0) {
            seedSubjects();
        }
        if (courseRepository.count() == 0) {
            seedTutorsAndCourses();
        } else {
            fixCourseSubjects();
        }
        if (testimonialRepository.count() == 0) {
            seedTestimonials();
        }
        if (directBookingRepository.count() == 0) {
            seedBookings();
        }
        if (jobPostingRepository.count() == 0) {
            seedJobPostings();
        }
        if (applicantRepository.count() == 0) {
            seedApplicants();
        }
        if (classSessionRepository.count() == 0) {
            seedClassSessions();
        }
        if (lessonLogRepository.count() == 0) {
            seedLessonLogs();
        }
        if (publicDocumentRepository.count() <= 1) {
            seedPublicDocuments();
        }
    }

    private void seedBookings() {
        User parent = userRepository.findByEmail("parent@gmail.com").orElse(null);
        TutorProfile tutor1 = tutorProfileRepository.findAll().stream().filter(t -> t.getFullName().contains("Nguyễn Hoàng Nam")).findFirst().orElse(null);
        
        if (parent != null && tutor1 != null) {
            DirectBooking b1 = new DirectBooking();
            b1.setParent(parent);
            b1.setTutor(tutor1);
            b1.setSubject("Toán 12 - Luyện thi Đại học");
            b1.setSchedule("Tối thứ 2, 4, 6 từ 19h30 - 21h30");
            b1.setLearningMode("ONLINE");
            b1.setPricePerSession(new BigDecimal("350000"));
            b1.setParentMessage("Cháu nhà học khá nhưng hay ẩu, thầy rèn giúp cháu. Xin cảm ơn.");
            b1.setStatus("PENDING");
            directBookingRepository.save(b1);
        }
    }

    private void seedJobPostings() {
        User parentUser = userRepository.findByEmail("parent@gmail.com").orElse(null);
        Parent parent = parentUser != null ? parentRepository.findByUserId(parentUser.getId()).orElse(null) : null;
        if (parent != null) {
            JobPosting jp = new JobPosting();
            jp.setParent(parent);
            jp.setTitle("Tìm gia sư Tiếng Anh IELTS 6.5+ cho con");
            jp.setSubject("Tiếng Anh");
            jp.setClassLevel("Lớp 11");
            jp.setDescription("Cháu đang cần học để thi IELTS vào tháng 12 năm nay. Cần gia sư có kinh nghiệm.");
            jp.setLocation("Hà Nội");
            jp.setDetailedAddress("Đống Đa, Hà Nội");
            jp.setSchedule("Tối T3, T5, T7");
            jp.setPricePerSession(250000.0);
            jp.setLearningMode("OFFLINE");
            jp.setRequirement("Gia sư nữ, đang là sinh viên Ngoại Thương hoặc Sư Phạm");
            jp.setStatus("RECRUITING");
            jobPostingRepository.save(jp);
        }
    }

    private void seedApplicants() {
        JobPosting jp = jobPostingRepository.findAll().stream()
                .filter(p -> p.getTitle().contains("IELTS 6.5+"))
                .findFirst().orElse(null);
        TutorProfile tutor2 = tutorProfileRepository.findAll().stream()
                .filter(t -> t.getFullName().contains("Trần Thị B")).findFirst().orElse(null);
        
        if (jp != null && tutor2 != null) {
            Applicant applicant = new Applicant();
            applicant.setJobPosting(jp);
            applicant.setTutorId(tutor2.getUser().getId().toString());
            applicant.setTutorName(tutor2.getFullName());
            applicant.setTutorAvatar(tutor2.getAvatarUrl());
            applicant.setMessage("Chào chị, em là sinh viên sư phạm Ngoại ngữ, IELTS 7.5. Em rất tự tin có thể giúp bé đạt mục tiêu IELTS 6.5 ạ.");
            applicant.setStatus("PENDING");
            applicantRepository.save(applicant);
        }
    }

    private void seedClassSessions() {
        User parentUser = userRepository.findByEmail("parent@gmail.com").orElse(null);
        Parent parent = parentUser != null ? parentRepository.findByUserId(parentUser.getId()).orElse(null) : null;
        User tutor3User = userRepository.findByEmail("tutor3@gmail.com").orElse(null);
        TutorProfile tutor3 = tutor3User != null ? tutorProfileRepository.findAll().stream().filter(t -> t.getUser().getId().equals(tutor3User.getId())).findFirst().orElse(null) : null;
        
        if (parent != null && tutor3 != null) {
            ClassSession session = new ClassSession();
            session.setParent(parent);
            session.setTutorProfileId(tutor3.getId());
            session.setTutorName(tutor3.getFullName());
            session.setTutorAvatar(tutor3.getAvatarUrl());
            session.setSubject("Tiếng Anh Giao Tiếp");
            session.setClassName("Tiếng Anh Giao Tiếp - Lớp Người đi làm");
            session.setSchedule("Tối Thứ 3, Thứ 5 (20h-21h30)");
            session.setPricePerSession(400000.0);
            session.setLearningMode("ONLINE");
            session.setStatus(ClassSessionStatus.CONFIRMED);
            
            // Generate mock meet link
            session.setMeetingLink("https://meet.google.com/abc-defg-hij");
            
            classSessionRepository.save(session);
        }
    }

    private void seedSubjects() {
        String[] subjectNames = {"Toán học", "Vật lý", "Hóa học", "Tiếng Anh", "Tin học", "Ngữ văn", "Sinh học", "Lịch sử", "Địa lý"};
        for (String name : subjectNames) {
            Subject subject = new Subject();
            subject.setName(name);
            subjectRepository.save(subject);
        }
    }

    private void fixCourseSubjects() {
        List<Subject> subjects = subjectRepository.findAll();
        Subject mathSubject = subjects.stream().filter(s -> s.getName().equals("Toán học")).findFirst().orElse(null);
        Subject physicsSubject = subjects.stream().filter(s -> s.getName().equals("Vật lý") || s.getName().equals("Vật lí")).findFirst().orElse(null);
        Subject chemistrySubject = subjects.stream().filter(s -> s.getName().equals("Hóa học") || s.getName().equals("Hoá học")).findFirst().orElse(null);
        Subject englishSubject = subjects.stream().filter(s -> s.getName().equals("Tiếng Anh")).findFirst().orElse(null);
        Subject itSubject = subjects.stream().filter(s -> s.getName().equals("Tin học")).findFirst().orElse(null);

        List<Course> courses = courseRepository.findAll();
        for (Course c : courses) {
            if (c.getSubject() == null) {
                String title = c.getTitle() != null ? c.getTitle().toLowerCase() : "";
                if (title.contains("toán")) c.setSubject(mathSubject);
                else if (title.contains("vật lý") || title.contains("vật lí")) c.setSubject(physicsSubject);
                else if (title.contains("ielts") || title.contains("tiếng anh")) c.setSubject(englishSubject);
                else if (title.contains("python") || title.contains("tin học") || title.contains("lập trình")) c.setSubject(itSubject);
                else if (title.contains("hóa học") || title.contains("hoá học")) c.setSubject(chemistrySubject);
                courseRepository.save(c);
            }
        }
    }

    private void seedTestimonials() {
        Testimonial t1 = new Testimonial();
        t1.setName("Chị Nguyễn Lan Anh");
        t1.setRole("Phụ huynh bé lớp 10");
        t1.setAvatar("https://ui-avatars.com/api/?name=Nguyen+Lan+Anh&background=random");
        t1.setQuote("Chỉ trong 2 ngày đăng bài đã có hơn 5 gia sư ứng tuyển. Thầy dạy con tôi bây giờ rất tận tâm và điểm số cải thiện rõ rệt. Cảm ơn StudyHub!");
        t1.setStars(5);
        testimonialRepository.save(t1);

        Testimonial t2 = new Testimonial();
        t2.setName("Em Trần Hoàng");
        t2.setRole("Gia sư — Sinh viên ĐH Bách Khoa");
        t2.setAvatar("https://ui-avatars.com/api/?name=Tran+Hoang&background=random");
        t2.setQuote("Nhờ StudyHub em đã có thêm thu nhập ổn định từ việc dạy 3 lớp song song. Hệ thống quản lý lịch dạy và tính phí rất minh bạch, em hoàn toàn tin tưởng. Đặc biệt nền tảng rất dễ sử dụng và hỗ trợ nhiệt tình, giải quyết thắc mắc nhanh chóng.");
        t2.setStars(5);
        testimonialRepository.save(t2);

        Testimonial t3 = new Testimonial();
        t3.setName("Anh Phạm Việt");
        t3.setRole("Phụ huynh bé lớp 5");
        t3.setAvatar("https://ui-avatars.com/api/?name=Pham+Viet&background=random");
        t3.setQuote("Ứng dụng tốt, gia sư chất lượng cao. Tuy nhiên giao diện đăng bài đôi khi hơi lag một chút, nhưng tổng thể dịch vụ tuyệt vời.");
        t3.setStars(4);
        testimonialRepository.save(t3);

        Testimonial t4 = new Testimonial();
        t4.setName("Chị Mai Chi");
        t4.setRole("Gia sư Tiếng Anh");
        t4.setAvatar("https://ui-avatars.com/api/?name=Mai+Chi&background=random");
        t4.setQuote("Nền tảng tuyệt vời giúp mình kết nối được với nhiều phụ huynh có nhu cầu. Nhờ StudyHub mình đã có thể tự chủ tài chính khi còn là sinh viên. Chắc chắn mình sẽ gắn bó lâu dài.");
        t4.setStars(5);
        testimonialRepository.save(t4);
    }

    private User createUser(String email, UserRole role, String fullName, String avatarUrl) {
        User u = new User();
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode("123456"));
        u.setRole(role);
        u.setFullName(fullName);
        u.setAvatarUrl(avatarUrl);
        return userRepository.save(u);
    }

    private void seedTutorsAndCourses() {
        if (!userRepository.existsByEmail("admin@gmail.com")) {
            createUser("admin@gmail.com", UserRole.ADMIN, "Admin System", null);
        }
        if (!userRepository.existsByEmail("parent@gmail.com")) {
            createUser("parent@gmail.com", UserRole.PARENT, "Phụ huynh Học sinh", "https://ui-avatars.com/api/?name=Phu+huynh&background=random");
        }
        
        if (parentRepository.count() == 0) {
            User parentUser = userRepository.findByEmail("parent@gmail.com").orElse(null);
            if (parentUser != null) {
                Parent parent = new Parent();
                parent.setUser(parentUser);
                parent.setName(parentUser.getFullName());
                parent.setEmail(parentUser.getEmail());
                parent.setPhone("0901234567");
                parent.setAvatar(parentUser.getAvatarUrl());
                parentRepository.save(parent);
            }
        }

        List<Subject> subjects = subjectRepository.findAll();
        
        Subject mathSubject = subjects.stream().filter(s -> s.getName().equals("Toán học")).findFirst().orElse(null);
        Subject physicsSubject = subjects.stream().filter(s -> s.getName().equals("Vật lý")).findFirst().orElse(null);
        Subject chemistrySubject = subjects.stream().filter(s -> s.getName().equals("Hóa học")).findFirst().orElse(null);
        Subject englishSubject = subjects.stream().filter(s -> s.getName().equals("Tiếng Anh")).findFirst().orElse(null);
        Subject itSubject = subjects.stream().filter(s -> s.getName().equals("Tin học")).findFirst().orElse(null);
        Subject literatureSubject = subjects.stream().filter(s -> s.getName().equals("Ngữ văn")).findFirst().orElse(null);
        Subject biologySubject = subjects.stream().filter(s -> s.getName().equals("Sinh học")).findFirst().orElse(null);
        Subject historySubject = subjects.stream().filter(s -> s.getName().equals("Lịch sử")).findFirst().orElse(null);
        Subject geographySubject = subjects.stream().filter(s -> s.getName().equals("Địa lý")).findFirst().orElse(null);

        // Tutor 1
        TutorProfile t1 = new TutorProfile();
        t1.setUser(createUser("tutor1@gmail.com", UserRole.TUTOR, "Thầy Nguyễn Hoàng Nam", "https://ui-avatars.com/api/?name=Nguyen+Hoang+Nam&background=random"));
        t1.setFullName("Thầy Nguyễn Hoàng Nam");
        t1.setIntroduction("Thạc sĩ Toán học - ĐH Sư Phạm HN. Nhiều năm kinh nghiệm giảng dạy và luyện thi đại học môn Toán.");
        t1.setAvatarUrl("https://ui-avatars.com/api/?name=Nguyen+Hoang+Nam&background=random");
        t1.setStatus(TutorStatus.APPROVED);
        t1.setEkycStatus(EkycStatus.SUCCESS);
        t1.setSimilarityScore(new BigDecimal("98.5"));
        t1.setIdCardFrontUrl("https://placehold.co/600x400?text=ID+Front");
        t1.setIdCardBackUrl("https://placehold.co/600x400?text=ID+Back");
        t1.setBirthDate(LocalDate.of(1990, 5, 15));
        t1.setAddress("Cầu Giấy, Hà Nội");
        t1.setPhoneNumber("0987654321");
        t1.setUniversityName("Đại học Sư phạm Hà Nội");
        t1.setMajor("Sư phạm Toán học");
        t1.setExperienceYears(5);
        t1.setDegreeImageUrl("https://placehold.co/600x400?text=Degree");
        t1.setCertificates(List.of("https://placehold.co/400x300?text=IELTS", "https://placehold.co/400x300?text=Certificate"));
        t1.setPrice(350000.0);
        t1.setTeachingMethod("ONLINE");
        t1.setAverageRating(4.9);
        t1.setTotalReviews(120);
        if (mathSubject != null) t1.setSubjects(Set.of(mathSubject));
        tutorProfileRepository.save(t1);

        Course c1 = new Course();
        c1.setTitle("Ôn thi Đại học môn Toán - Lớp 12: Chuyên sâu Giải tích & Hình học");
        c1.setDescription("Khóa học này được thiết kế đặc biệt dành cho học sinh lớp 12 đang chuẩn bị cho kỳ thi Tốt nghiệp THPT và xét tuyển Đại học.");
        c1.setLocation("Trực tuyến qua Zoom (Online)");
        c1.setLocationType("computer");
        c1.setPrice("350.000đ");
        c1.setImage("https://images.unsplash.com/photo-1632516643720-e7f0d0e12e1b?w=600");
        c1.setSchedule("Thứ 2 - Thứ 4 - Thứ 6");
        c1.setRating(4.9);
        c1.setReviewCount(120);
        c1.setTutor(t1);
        c1.setSubject(mathSubject);
        courseRepository.save(c1);

        // Tutor 2
        TutorProfile t2 = new TutorProfile();
        t2.setUser(createUser("tutor2@gmail.com", UserRole.TUTOR, "Cô Trần Thị B", "https://ui-avatars.com/api/?name=Tran+Thi+B&background=random"));
        t2.setFullName("Cô Trần Thị B");
        t2.setIntroduction("Thạc sĩ Vật Lý. Giảng dạy tận tâm, dễ hiểu.");
        t2.setAvatarUrl("https://ui-avatars.com/api/?name=Tran+Thi+B&background=random");
        t2.setStatus(TutorStatus.APPROVED);
        t2.setEkycStatus(EkycStatus.SUCCESS);
        t2.setSimilarityScore(new BigDecimal("95.2"));
        t2.setIdCardFrontUrl("https://placehold.co/600x400?text=ID+Front");
        t2.setIdCardBackUrl("https://placehold.co/600x400?text=ID+Back");
        t2.setBirthDate(LocalDate.of(1992, 8, 22));
        t2.setAddress("Quận 1, TP.HCM");
        t2.setPhoneNumber("0912345678");
        t2.setUniversityName("Đại học Sư phạm TP.HCM");
        t2.setMajor("Sư phạm Vật lý");
        t2.setExperienceYears(4);
        t2.setDegreeImageUrl("https://placehold.co/600x400?text=Degree");
        t2.setPrice(180000.0);
        t2.setTeachingMethod("ONLINE");
        t2.setAverageRating(4.8);
        t2.setTotalReviews(85);
        if (physicsSubject != null) t2.setSubjects(Set.of(physicsSubject));
        tutorProfileRepository.save(t2);

        Course c2 = new Course();
        c2.setTitle("Bồi dưỡng HSG Vật lý 11");
        c2.setDescription("Khóa học bồi dưỡng học sinh giỏi Vật lý 11 giúp các em tiếp cận với các dạng bài tập nâng cao.");
        c2.setLocation("Học qua Zoom/Google Meet (Online)");
        c2.setLocationType("videocam");
        c2.setPrice("180.000đ");
        c2.setImage("https://images.unsplash.com/photo-1610486045864-180a068019b8?w=600");
        c2.setSchedule("Thứ 3 - Thứ 5");
        c2.setRating(4.8);
        c2.setReviewCount(85);
        c2.setTutor(t2);
        c2.setSubject(physicsSubject);
        courseRepository.save(c2);

        // Tutor 3
        TutorProfile t3 = new TutorProfile();
        t3.setUser(createUser("tutor3@gmail.com", UserRole.TUTOR, "Mr. David Smith", "https://ui-avatars.com/api/?name=David+Smith&background=random"));
        t3.setFullName("Mr. David Smith");
        t3.setIntroduction("Bản ngữ (USA), IELTS 9.0. Phương pháp giảng dạy hiện đại, hiệu quả.");
        t3.setAvatarUrl("https://ui-avatars.com/api/?name=David+Smith&background=random");
        t3.setStatus(TutorStatus.APPROVED);
        t3.setEkycStatus(EkycStatus.SUCCESS);
        t3.setSimilarityScore(new BigDecimal("99.1"));
        t3.setIdCardFrontUrl("https://placehold.co/600x400?text=ID+Front");
        t3.setIdCardBackUrl("https://placehold.co/600x400?text=ID+Back");
        t3.setBirthDate(LocalDate.of(1985, 3, 10));
        t3.setAddress("Bình Thạnh, TP.HCM");
        t3.setPhoneNumber("0988776655");
        t3.setUniversityName("University of California, Berkeley");
        t3.setMajor("English Literature");
        t3.setExperienceYears(8);
        t3.setDegreeImageUrl("https://placehold.co/600x400?text=Degree");
        t3.setCertificates(List.of("https://placehold.co/400x300?text=TESOL", "https://placehold.co/400x300?text=CELTA"));
        t3.setPrice(450000.0);
        t3.setTeachingMethod("OFFLINE");
        t3.setAverageRating(5.0);
        t3.setTotalReviews(200);
        if (englishSubject != null) t3.setSubjects(Set.of(englishSubject));
        tutorProfileRepository.save(t3);

        Course c3 = new Course();
        c3.setTitle("IELTS General 6.5+ Cam kết");
        c3.setDescription("Khóa học luyện thi IELTS General cam kết đầu ra 6.5+ dành cho người định cư hoặc làm việc nước ngoài.");
        c3.setLocation("Quận Bình Thạnh, TP.HCM (Offline)");
        c3.setLocationType("location_on");
        c3.setPrice("450.000đ");
        c3.setImage("https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600");
        c3.setSchedule("Thứ Bảy - Chủ Nhật");
        c3.setRating(5.0);
        c3.setReviewCount(200);
        c3.setTutor(t3);
        c3.setSubject(englishSubject);
        courseRepository.save(c3);

        // Course 4
        TutorProfile t4 = new TutorProfile();
        t4.setUser(createUser("tutor4@gmail.com", UserRole.TUTOR, "Lê Minh C", "https://ui-avatars.com/api/?name=Le+Minh+C&background=random"));
        t4.setFullName("Lê Minh C");
        t4.setIntroduction("Software Engineer at FPT. Hướng dẫn tận tình dự án thực tế.");
        t4.setAvatarUrl("https://ui-avatars.com/api/?name=Le+Minh+C&background=random");
        t4.setStatus(TutorStatus.APPROVED);
        t4.setEkycStatus(EkycStatus.SUCCESS);
        t4.setSimilarityScore(new BigDecimal("91.8"));
        t4.setIdCardFrontUrl("https://placehold.co/600x400?text=ID+Front");
        t4.setIdCardBackUrl("https://placehold.co/600x400?text=ID+Back");
        t4.setBirthDate(LocalDate.of(1998, 11, 5));
        t4.setAddress("Quận 9, TP.HCM");
        t4.setPhoneNumber("0909090909");
        t4.setUniversityName("Đại học Bách Khoa TP.HCM");
        t4.setMajor("Khoa học Máy tính");
        t4.setExperienceYears(2);
        t4.setDegreeImageUrl("https://placehold.co/600x400?text=Degree");
        t4.setPrice(300000.0);
        t4.setTeachingMethod("ONLINE");
        t4.setAverageRating(4.7);
        t4.setTotalReviews(50);
        if (itSubject != null) t4.setSubjects(Set.of(itSubject));
        tutorProfileRepository.save(t4);

        Course c4 = new Course();
        c4.setTitle("Lập trình Python cho người mới");
        c4.setDescription("Khóa học Python căn bản trang bị tư duy lập trình cốt lõi, cú pháp Python, cách xử lý dữ liệu.");
        c4.setLocation("Học qua Discord (Online)");
        c4.setLocationType("videocam");
        c4.setPrice("300.000đ");
        c4.setImage("https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600");
        c4.setSchedule("Thứ 2 - Thứ 5");
        c4.setRating(4.7);
        c4.setReviewCount(50);
        c4.setTutor(t4);
        c4.setSubject(itSubject);
        courseRepository.save(c4);

        // Tutor 5 (Pending eKYC)
        TutorProfile tPending = new TutorProfile();
        tPending.setUser(createUser("tutorpending@gmail.com", UserRole.TUTOR, "Vũ Đức Phát", "https://ui-avatars.com/api/?name=Vu+Duc+Phat&background=random"));
        tPending.setFullName("Vũ Đức Phát");
        tPending.setIntroduction("Cử nhân Sinh học - ĐH Khoa học Tự nhiên");
        tPending.setAvatarUrl("https://ui-avatars.com/api/?name=Vu+Duc+Phat&background=random");
        tPending.setStatus(TutorStatus.PENDING);
        tPending.setEkycStatus(EkycStatus.PROCESSING);
        tPending.setIdCardFrontUrl("https://example.com/cccd_front.jpg");
        tPending.setSimilarityScore(BigDecimal.valueOf(95.5));
        tPending.setDegreeImageUrl("https://example.com/degree.jpg");
        if (biologySubject != null) tPending.setSubjects(Set.of(biologySubject));
        tutorProfileRepository.save(tPending);

        // Pending Tutor 2
        TutorProfile tPending2 = new TutorProfile();
        tPending2.setUser(createUser("tutorpending2@gmail.com", UserRole.TUTOR, "Lê Trọng Nghĩa", "https://ui-avatars.com/api/?name=Le+Trong+Nghia&background=random"));
        tPending2.setFullName("Lê Trọng Nghĩa");
        tPending2.setIntroduction("Kỹ sư phần mềm - 3 năm kinh nghiệm");
        tPending2.setAvatarUrl("https://ui-avatars.com/api/?name=Le+Trong+Nghia&background=random");
        tPending2.setStatus(TutorStatus.PENDING);
        tPending2.setEkycStatus(EkycStatus.PROCESSING);
        tPending2.setIdCardFrontUrl("https://example.com/cccd_front.jpg");
        tPending2.setSimilarityScore(BigDecimal.valueOf(89.2));
        tPending2.setDegreeImageUrl("https://example.com/degree.jpg");
        if (itSubject != null) tPending2.setSubjects(Set.of(itSubject));
        tutorProfileRepository.save(tPending2);

        // Pending Tutor 3
        TutorProfile tPending3 = new TutorProfile();
        tPending3.setUser(createUser("tutorpending3@gmail.com", UserRole.TUTOR, "Hoàng Mai Ngọc", "https://ui-avatars.com/api/?name=Hoang+Mai+Ngoc&background=random"));
        tPending3.setFullName("Hoàng Mai Ngọc");
        tPending3.setIntroduction("IELTS 8.0 - Cử nhân Sư phạm Tiếng Anh");
        tPending3.setAvatarUrl("https://ui-avatars.com/api/?name=Hoang+Mai+Ngoc&background=random");
        tPending3.setStatus(TutorStatus.PENDING);
        tPending3.setEkycStatus(EkycStatus.PROCESSING);
        tPending3.setIdCardFrontUrl("https://example.com/cccd_front.jpg");
        tPending3.setSimilarityScore(BigDecimal.valueOf(98.1));
        tPending3.setDegreeImageUrl("https://example.com/degree.jpg");
        if (englishSubject != null) tPending3.setSubjects(Set.of(englishSubject));
        tutorProfileRepository.save(tPending3);

        // Pending Tutor 4
        TutorProfile tPending4 = new TutorProfile();
        tPending4.setUser(createUser("tutorpending4@gmail.com", UserRole.TUTOR, "Đỗ Văn Hùng", "https://ui-avatars.com/api/?name=Do+Van+Hung&background=random"));
        tPending4.setFullName("Đỗ Văn Hùng");
        tPending4.setIntroduction("Sinh viên xuất sắc ĐH Bách Khoa");
        tPending4.setAvatarUrl("https://ui-avatars.com/api/?name=Do+Van+Hung&background=random");
        tPending4.setStatus(TutorStatus.PENDING);
        tPending4.setEkycStatus(EkycStatus.PROCESSING);
        tPending4.setIdCardFrontUrl("https://example.com/cccd_front.jpg");
        tPending4.setSimilarityScore(BigDecimal.valueOf(72.4));
        tPending4.setDegreeImageUrl("https://example.com/degree.jpg");
        if (mathSubject != null) tPending4.setSubjects(Set.of(mathSubject));
        tutorProfileRepository.save(tPending4);

        // Tutor for testing new eKYC feature
        TutorProfile tTestEkyc = new TutorProfile();
        tTestEkyc.setUser(createUser("testekyc@gmail.com", UserRole.TUTOR, "Gia sư Test eKYC", "https://ui-avatars.com/api/?name=Test+eKYC&background=random"));
        tTestEkyc.setFullName("Gia sư Test eKYC");
        tTestEkyc.setIntroduction("Tài khoản này dùng để test chức năng upload ảnh và eKYC");
        tTestEkyc.setAvatarUrl("https://ui-avatars.com/api/?name=Test+eKYC&background=random");
        tTestEkyc.setStatus(TutorStatus.DRAFT);
        tTestEkyc.setEkycStatus(EkycStatus.NOT_STARTED);
        if (itSubject != null) tTestEkyc.setSubjects(Set.of(itSubject));
        tutorProfileRepository.save(tTestEkyc);

        // Course 5
        Course c5 = new Course();
        c5.setTitle("Tiếng Anh Giao Tiếp Người Đi Làm");
        c5.setDescription("Khóa học giúp cải thiện khả năng giao tiếp, tự tin thuyết trình bằng tiếng Anh trong công việc.");
        c5.setLocation("Quận 1, TP.HCM (Offline)");
        c5.setLocationType("location_on");
        c5.setPrice("500.000đ");
        c5.setImage("https://images.unsplash.com/photo-1577412647305-991150c7d163?q=80&w=600&auto=format&fit=crop");
        c5.setSchedule("Thứ 3 - Thứ 5 - Thứ 7");
        c5.setRating(4.9);
        c5.setReviewCount(150);
        c5.setTutor(t3); // reuse David Smith
        c5.setSubject(englishSubject);
        courseRepository.save(c5);

        // Course 6
        Course c6 = new Course();
        c6.setTitle("Hóa Học 10 - Lấy Gốc Nhanh Chóng");
        c6.setDescription("Lấy lại căn bản Hóa học lớp 10, nắm vững bảng tuần hoàn và các phản ứng hóa học cơ bản.");
        c6.setLocation("Học qua Google Meet (Online)");
        c6.setLocationType("videocam");
        c6.setPrice("200.000đ");
        c6.setImage("https://images.unsplash.com/photo-1603126859738-4b216ce22a12?q=80&w=600&auto=format&fit=crop");
        c6.setSchedule("Chủ Nhật");
        c6.setRating(4.6);
        c6.setReviewCount(30);
        c6.setTutor(t1); // reuse Nguyễn Hoàng Nam
        c6.setSubject(chemistrySubject);
        courseRepository.save(c6);

        // Tutor 5 (Literature)
        TutorProfile t5 = new TutorProfile();
        t5.setUser(createUser("tutor5@gmail.com", UserRole.TUTOR, "Cô Lê Hà", "https://ui-avatars.com/api/?name=Le+Ha&background=random"));
        t5.setFullName("Cô Lê Hà");
        t5.setIntroduction("Giáo viên chuyên Văn 10 năm kinh nghiệm");
        t5.setAvatarUrl("https://ui-avatars.com/api/?name=Le+Ha&background=random");
        t5.setStatus(TutorStatus.APPROVED);
        t5.setPrice(200000.0);
        t5.setTeachingMethod("ONLINE");
        t5.setAverageRating(4.9);
        t5.setTotalReviews(150);
        if (literatureSubject != null) t5.setSubjects(Set.of(literatureSubject));
        tutorProfileRepository.save(t5);

        Course c7 = new Course();
        c7.setTitle("Luyện Thi Đại Học Môn Ngữ Văn");
        c7.setDescription("Hệ thống kiến thức trọng tâm, rèn kỹ năng viết bài nghị luận xã hội và văn học.");
        c7.setLocation("Trực tuyến (Zoom)");
        c7.setLocationType("computer");
        c7.setPrice("200.000đ");
        c7.setImage("https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600");
        c7.setSchedule("Thứ 4 - Thứ 6");
        c7.setRating(4.9);
        c7.setReviewCount(150);
        c7.setTutor(t5);
        c7.setSubject(literatureSubject);
        courseRepository.save(c7);

        // Tutor 6 (Biology)
        TutorProfile t6 = new TutorProfile();
        t6.setUser(createUser("tutor6@gmail.com", UserRole.TUTOR, "Thầy Vũ Dũng", "https://ui-avatars.com/api/?name=Vu+Dung&background=random"));
        t6.setFullName("Thầy Vũ Dũng");
        t6.setIntroduction("Sinh viên Y Dược loại giỏi");
        t6.setAvatarUrl("https://ui-avatars.com/api/?name=Vu+Dung&background=random");
        t6.setStatus(TutorStatus.APPROVED);
        t6.setPrice(150000.0);
        t6.setTeachingMethod("OFFLINE");
        t6.setAverageRating(4.8);
        t6.setTotalReviews(90);
        if (biologySubject != null) t6.setSubjects(Set.of(biologySubject));
        tutorProfileRepository.save(t6);

        Course c8 = new Course();
        c8.setTitle("Bồi Dưỡng Sinh Học 12");
        c8.setDescription("Tổng ôn Sinh học, nắm vững di truyền và tiến hóa.");
        c8.setLocation("Hà Nội (Offline)");
        c8.setLocationType("location_on");
        c8.setPrice("150.000đ");
        c8.setImage("https://images.unsplash.com/photo-1530213786676-4189f1756920?w=600");
        c8.setSchedule("Thứ 7 - CN");
        c8.setRating(4.8);
        c8.setReviewCount(90);
        c8.setTutor(t6);
        c8.setSubject(biologySubject);
        courseRepository.save(c8);

        // Tutor 7 (History)
        TutorProfile t7 = new TutorProfile();
        t7.setUser(createUser("tutor7@gmail.com", UserRole.TUTOR, "Cô Đinh Hương", "https://ui-avatars.com/api/?name=Dinh+Huong&background=random"));
        t7.setFullName("Cô Đinh Hương");
        t7.setIntroduction("Thạc sĩ Sử học");
        t7.setAvatarUrl("https://ui-avatars.com/api/?name=Dinh+Huong&background=random");
        t7.setStatus(TutorStatus.APPROVED);
        t7.setPrice(250000.0);
        t7.setTeachingMethod("ONLINE");
        t7.setAverageRating(4.7);
        t7.setTotalReviews(60);
        if (historySubject != null) t7.setSubjects(Set.of(historySubject));
        tutorProfileRepository.save(t7);

        Course c9 = new Course();
        c9.setTitle("Lịch Sử 12 Lấy Gốc");
        c9.setDescription("Bí quyết ghi nhớ các sự kiện lịch sử không bao giờ quên.");
        c9.setLocation("Học qua Google Meet");
        c9.setLocationType("videocam");
        c9.setPrice("250.000đ");
        c9.setImage("https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600");
        c9.setSchedule("Thứ 2 - Thứ 4");
        c9.setRating(4.7);
        c9.setReviewCount(60);
        c9.setTutor(t7);
        c9.setSubject(historySubject);
        courseRepository.save(c9);

        // Tutor 8 (Geography)
        TutorProfile t8 = new TutorProfile();
        t8.setUser(createUser("tutor8@gmail.com", UserRole.TUTOR, "Thầy Phan Bách", "https://ui-avatars.com/api/?name=Phan+Bach&background=random"));
        t8.setFullName("Thầy Phan Bách");
        t8.setIntroduction("Chuyên gia luyện thi Địa Lý");
        t8.setAvatarUrl("https://ui-avatars.com/api/?name=Phan+Bach&background=random");
        t8.setStatus(TutorStatus.APPROVED);
        t8.setPrice(220000.0);
        t8.setTeachingMethod("ONLINE");
        t8.setAverageRating(4.8);
        t8.setTotalReviews(80);
        if (geographySubject != null) t8.setSubjects(Set.of(geographySubject));
        tutorProfileRepository.save(t8);

        Course c10 = new Course();
        c10.setTitle("Địa Lý Thực Hành Atlat");
        c10.setDescription("Kỹ năng xem Atlat và xử lý số liệu biểu đồ cực nhanh.");
        c10.setLocation("Trực tuyến (Zoom)");
        c10.setLocationType("computer");
        c10.setPrice("220.000đ");
        c10.setImage("https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600");
        c10.setSchedule("Chủ Nhật");
        c10.setRating(4.8);
        c10.setReviewCount(80);
        c10.setTutor(t8);
        c10.setSubject(geographySubject);
        courseRepository.save(c10);
    }

    private void seedLessonLogs() {
        List<ClassSession> sessions = classSessionRepository.findAll();
        if (!sessions.isEmpty()) {
            ClassSession session = sessions.get(0);
            
            LessonLog log1 = new LessonLog();
            log1.setClassSession(session);
            log1.setScheduledDate(java.time.LocalDateTime.now().minusDays(2));
            log1.setTitle("Buổi 1: Giới thiệu và giao tiếp cơ bản");
            log1.setContent("Làm quen với các mẫu câu giới thiệu bản thân thông dụng. Luyện phát âm các âm cơ bản.");
            log1.setTutorFeedback("Học viên tiếp thu nhanh, cần chú ý phát âm gió.");
            log1.setStatus(com.management.studyhub.entity.enums.LessonStatus.PRESENT);
            log1.setParentApprovalStatus(com.management.studyhub.entity.enums.ParentApprovalStatus.PENDING);
            lessonLogRepository.save(log1);

            LessonLog log2 = new LessonLog();
            log2.setClassSession(session);
            log2.setScheduledDate(java.time.LocalDateTime.now().minusDays(1));
            log2.setTitle("Buổi 2: Giao tiếp nơi công sở");
            log2.setContent("Học các mẫu câu viết email và giao tiếp điện thoại với đồng nghiệp.");
            log2.setTutorFeedback("Học viên làm tốt bài tập viết email, cần tự tin hơn khi nói điện thoại.");
            log2.setStatus(com.management.studyhub.entity.enums.LessonStatus.PRESENT);
            log2.setParentApprovalStatus(com.management.studyhub.entity.enums.ParentApprovalStatus.PENDING);
            lessonLogRepository.save(log2);
        }
    }

    private void seedPublicDocuments() {
        User admin = userRepository.findByEmail("admin@gmail.com").orElse(null);
        Long adminId = admin != null ? admin.getId() : 1L;

        String[][] docs = {
            {"Sách giáo khoa Toán 1 (Kết nối tri thức)", "https://giaokhoaonline.com/sach-toan-1-t1-ket-noi/", "Cấp 1", "Lớp 1", "Toán"},
            {"Sách giáo khoa Tiếng Anh 2 (Family and Friends)", "https://giaokhoaonline.com/sach-tieng-anh-2-family-and-friends/", "Cấp 1", "Lớp 2", "Tiếng Anh"},
            {"Sách giáo khoa Toán 3 (Chân trời sáng tạo)", "https://giaokhoaonline.com/sach-toan-3-t1-chan-troi/", "Cấp 1", "Lớp 3", "Toán"},
            {"Sách giáo khoa Tiếng Anh 4 (Global Success)", "https://giaokhoaonline.com/sach-tieng-anh-4-tap-1-global-success/", "Cấp 1", "Lớp 4", "Tiếng Anh"},
            {"Sách giáo khoa Toán 5 (Kết nối tri thức)", "https://giaokhoaonline.com/sach-toan-5-t1-ket-noi/", "Cấp 1", "Lớp 5", "Toán"},
            {"Sách giáo khoa Ngữ văn 6 (Kết nối tri thức)", "https://giaokhoaonline.com/sach-ngu-van-6-tap-1-ket-noi/", "Cấp 2", "Lớp 6", "Ngữ văn"},
            {"Sách giáo khoa Toán 7 (Cánh Diều)", "https://giaokhoaonline.com/sach-toan-7-t1-canh-dieu/", "Cấp 2", "Lớp 7", "Toán"},
            {"Sách giáo khoa Tin học 8 (Cánh Diều)", "https://giaokhoaonline.com/sach-tin-hoc-8-canh-dieu/", "Cấp 2", "Lớp 8", "Tin học"},
            {"Sách giáo khoa Hóa học 9 (Kết nối tri thức)", "https://giaokhoaonline.com/sach-hoa-hoc-9-ket-noi/", "Cấp 2", "Lớp 9", "Hóa học"},
            {"Sách giáo khoa Vật lý 10 (Chân trời sáng tạo)", "https://giaokhoaonline.com/sach-vat-ly-10-chan-troi/", "Cấp 3", "Lớp 10", "Vật lý"},
            {"Sách giáo khoa Toán 11 (Kết nối tri thức)", "https://giaokhoaonline.com/sach-toan-11-t1-ket-noi/", "Cấp 3", "Lớp 11", "Toán"},
            {"Sách giáo khoa Ngữ văn 12 (Kết nối tri thức)", "https://giaokhoaonline.com/sach-ngu-van-12-tap-1-ket-noi/", "Cấp 3", "Lớp 12", "Ngữ văn"}
        };

        for (String[] docInfo : docs) {
            PublicDocument doc = new PublicDocument();
            doc.setTitle(docInfo[0]);
            doc.setFileUrl(docInfo[1]);
            doc.setUploadedBy(adminId);
            doc.setSchoolLevel(docInfo[2]);
            doc.setGrade(docInfo[3]);
            doc.setSubject(docInfo[4]);
            doc.setCategory("Sách giáo khoa");
            publicDocumentRepository.save(doc);
        }
    }
}
