package com.management.studyhub.repository;

import com.management.studyhub.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository extends JpaRepository<Subject, Integer> {
}
