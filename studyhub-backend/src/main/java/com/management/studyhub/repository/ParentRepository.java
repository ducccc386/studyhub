package com.management.studyhub.repository;

import com.management.studyhub.entity.Parent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ParentRepository extends JpaRepository<Parent, Long> {
    Optional<Parent> findByUserId(Long userId);
}

