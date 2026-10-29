package com.university.lms.repository;

import com.university.lms.entity.AssignmentEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<AssignmentEvaluation, Long> {

    Optional<AssignmentEvaluation> findBySubmissionId(Long submissionId);
}
