package com.management.studyhub.service;

import com.management.studyhub.dto.CourseDto;
import com.management.studyhub.entity.Course;
import com.management.studyhub.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import com.management.studyhub.repository.TutorProfileRepository;
import com.management.studyhub.repository.SubjectRepository;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final SubjectRepository subjectRepository;

    @Override
    public List<CourseDto> getFeaturedCourses() {
        // Fetch top 6 courses sorted by rating and review count
        List<Course> courses = courseRepository.findFeaturedCourses(PageRequest.of(0, 6));
        
        return courses.stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public List<CourseDto> getAllCourses(List<Integer> subjectIds, Double maxPrice, String teachingMethod, List<String> grades, String keyword) {
        List<Course> courses;
        if (subjectIds != null && !subjectIds.isEmpty()) {
            courses = courseRepository.findBySubjectIdIn(subjectIds);
        } else {
            courses = courseRepository.findAllActiveCourses();
        }

        return courses.stream()
            .filter(c -> c.getStatus() == null || "ACTIVE".equals(c.getStatus()))
            .filter(c -> {
                if (maxPrice != null) {
                    String priceStr = c.getPrice() != null ? c.getPrice().replaceAll("[^0-9]", "") : "";
                    if (!priceStr.isEmpty()) {
                        try {
                            double price = Double.parseDouble(priceStr);
                            if (price > maxPrice) return false;
                        } catch (Exception ignored) {}
                    }
                }
                if (teachingMethod != null && !teachingMethod.isEmpty() && !teachingMethod.equalsIgnoreCase("ALL")) {
                    boolean isOnline = "computer".equals(c.getLocationType()) || "videocam".equals(c.getLocationType()) || "Online".equalsIgnoreCase(c.getLocationType());
                    if (teachingMethod.equalsIgnoreCase("ONLINE") && !isOnline) return false;
                    if (teachingMethod.equalsIgnoreCase("OFFLINE") && isOnline) return false;
                }
                if (grades != null && !grades.isEmpty()) {
                    boolean matchGrade = false;
                    String title = c.getTitle() != null ? c.getTitle().toLowerCase() : "";
                    String desc = c.getDescription() != null ? c.getDescription().toLowerCase() : "";
                    for (String grade : grades) {
                        String g = grade.toLowerCase();
                        String gradeNumber = g.replaceAll("[^0-9]", "");
                        if (!gradeNumber.isEmpty()) {
                            if (title.contains(gradeNumber) || desc.contains(gradeNumber)) {
                                matchGrade = true;
                                break;
                            }
                        } else {
                            if (title.contains(g) || desc.contains(g)) {
                                matchGrade = true;
                                break;
                            }
                        }
                    }
                    if (!matchGrade) return false;
                }
                if (keyword != null && !keyword.trim().isEmpty()) {
                    String title = c.getTitle() != null ? c.getTitle().toLowerCase() : "";
                    String subjectName = c.getSubject() != null ? c.getSubject().getName().toLowerCase() : "";
                    String kw = keyword.toLowerCase().trim();
                    if (!title.contains(kw) && !subjectName.contains(kw)) return false;
                }
                return true;
            })
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    private CourseDto mapToDto(Course course) {
        CourseDto dto = new CourseDto();
        dto.setId(course.getId());
        dto.setTitle(course.getTitle());
        dto.setDescription(course.getDescription());
        dto.setLocation(course.getLocation());
        dto.setLocationType(course.getLocationType());
        dto.setPrice(course.getPrice());
        dto.setImage(course.getImage());
        dto.setSchedule(course.getSchedule());
        
        // Format rating
        if (course.getRating() != null) {
            dto.setRating(String.format("%.1f", course.getRating()));
        } else {
            dto.setRating("0.0");
        }
        dto.setReviewCount(course.getReviewCount() != null ? course.getReviewCount() : 0);

        if (course.getTutor() != null) {
            dto.setTutorId(course.getTutor().getId());
            dto.setTutorName(course.getTutor().getFullName());
            dto.setTutorDesc(course.getTutor().getIntroduction() != null ? course.getTutor().getIntroduction() : "Gia sư tâm huyết");
            dto.setTutorAvatar(course.getTutor().getAvatarUrl());
            dto.setTutorAddress(course.getTutor().getAddress());
            dto.setTutorExperience(course.getTutor().getExperienceYears() + " năm kinh nghiệm");
            dto.setTutorVerified(course.getTutor().getEkycStatus() != null && course.getTutor().getEkycStatus().name().equals("SUCCESS"));
            dto.setTutorUniversity(course.getTutor().getUniversityName());
            dto.setTutorMajor(course.getTutor().getMajor());
        }

        if (course.getSubject() != null) {
            dto.setSubjectId(course.getSubject().getId());
            dto.setSubjectName(course.getSubject().getName());
        }

        dto.setStatus(course.getStatus());

        return dto;
    }

    @Override
    public CourseDto createCourse(Long tutorId, CourseDto courseDto) {
        Course course = new Course();
        course.setTitle(courseDto.getTitle());
        course.setDescription(courseDto.getDescription());
        course.setPrice(courseDto.getPrice());
        course.setLocationType(courseDto.getLocationType());
        course.setLocation(courseDto.getLocation() != null && !courseDto.getLocation().isEmpty() ? courseDto.getLocation() : "Học Online");
        course.setSchedule(courseDto.getSchedule() != null ? courseDto.getSchedule() : "TBD");
        course.setStatus("PENDING_APPROVAL");
        
        course.setRating(0.0);
        course.setReviewCount(0);
        // default image if null
        course.setImage(courseDto.getImage() != null ? courseDto.getImage() : "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80");

        if (tutorId != null) {
            tutorProfileRepository.findById(tutorId).ifPresent(course::setTutor);
        }

        if (courseDto.getSubjectName() != null && !courseDto.getSubjectName().isEmpty()) {
            subjectRepository.findAll().stream()
                .filter(s -> s.getName().equalsIgnoreCase(courseDto.getSubjectName()))
                .findFirst()
                .ifPresent(course::setSubject);
        }

        Course saved = courseRepository.save(course);
        return mapToDto(saved);
    }

    @Override
    public List<CourseDto> getPendingCourses() {
        return courseRepository.findAll().stream()
                .filter(c -> "PENDING_APPROVAL".equals(c.getStatus()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public CourseDto approveCourse(Long id) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Course not found"));
        course.setStatus("ACTIVE");
        return mapToDto(courseRepository.save(course));
    }

    @Override
    public CourseDto rejectCourse(Long id) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Course not found"));
        course.setStatus("REJECTED");
        return mapToDto(courseRepository.save(course));
    }

    @Override
    public CourseDto getCourseById(Long id) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Course not found"));
        return mapToDto(course);
    }

    @Override
    public List<CourseDto> getCoursesByTutorId(Long tutorId) {
        return courseRepository.findByTutorId(tutorId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public CourseDto updateCourse(Long id, CourseDto courseDto) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        course.setTitle(courseDto.getTitle());
        course.setDescription(courseDto.getDescription());
        course.setPrice(courseDto.getPrice());
        course.setLocationType(courseDto.getLocationType());
        course.setLocation(courseDto.getLocation() != null && !courseDto.getLocation().isEmpty() ? courseDto.getLocation() : "Học Online");
        course.setSchedule(courseDto.getSchedule() != null ? courseDto.getSchedule() : "TBD");
        
        Course updatedCourse = courseRepository.save(course);
        return mapToDto(updatedCourse);
    }

    @Override
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        courseRepository.delete(course);
    }
}
