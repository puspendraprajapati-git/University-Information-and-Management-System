package com.university.lms.repository;

import com.university.lms.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    List<Assignment> findBySubjectIdOrderByCreatedAtDesc(Long subjectId);

    List<Assignment> findByFacultyIdOrderByCreatedAtDesc(Long facultyId);

    List<Assignment> findAllByOrderByCreatedAtDesc();
}
