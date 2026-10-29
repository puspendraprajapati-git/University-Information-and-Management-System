package com.university.lms.repository;

import com.university.lms.entity.LearningResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<LearningResource, Long> {

    List<LearningResource> findBySubjectIdOrderByUploadedAtDesc(Long subjectId);

    List<LearningResource> findByUploadedByOrderByUploadedAtDesc(Long uploadedBy);

    List<LearningResource> findAllByOrderByUploadedAtDesc();
}
