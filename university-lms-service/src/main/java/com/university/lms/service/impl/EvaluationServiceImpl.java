package com.university.lms.service.impl;

import com.university.lms.dto.EvaluationReqDTO;
import com.university.lms.dto.EvaluationRespDTO;
import com.university.lms.entity.AssignmentEvaluation;
import com.university.lms.entity.AssignmentSubmission;
import com.university.lms.entity.SubmissionStatus;
import com.university.lms.exception.ResourceNotFoundException;
import com.university.lms.repository.EvaluationRepository;
import com.university.lms.repository.SubmissionRepository;
import com.university.lms.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class EvaluationServiceImpl implements EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final SubmissionRepository submissionRepository;

    @Override
    public EvaluationRespDTO evaluateSubmission(EvaluationReqDTO dto) {
        AssignmentSubmission submission = submissionRepository.findById(dto.getSubmissionId())
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with id: " + dto.getSubmissionId()));

        Optional<AssignmentEvaluation> existingOpt = evaluationRepository.findBySubmissionId(dto.getSubmissionId());

        AssignmentEvaluation evaluation;
        if (existingOpt.isPresent()) {
            evaluation = existingOpt.get();
            evaluation.setEvaluatorId(dto.getEvaluatorId());
            evaluation.setMarks(dto.getMarks());
            evaluation.setFeedback(dto.getFeedback());
        } else {
            evaluation = AssignmentEvaluation.builder()
                    .submissionId(dto.getSubmissionId())
                    .evaluatorId(dto.getEvaluatorId())
                    .marks(dto.getMarks())
                    .feedback(dto.getFeedback())
                    .build();
        }

        AssignmentEvaluation saved = evaluationRepository.save(evaluation);

        // Update submission status to EVALUATED
        submission.setStatus(SubmissionStatus.EVALUATED);
        submissionRepository.save(submission);

        return EvaluationRespDTO.builder()
                .evaluationId(saved.getEvaluationId())
                .submissionId(saved.getSubmissionId())
                .evaluatorId(saved.getEvaluatorId())
                .marks(saved.getMarks())
                .feedback(saved.getFeedback())
                .evaluatedAt(saved.getEvaluatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public EvaluationRespDTO getEvaluationBySubmissionId(Long submissionId) {
        AssignmentEvaluation evaluation = evaluationRepository.findBySubmissionId(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation not found for submission id: " + submissionId));

        return EvaluationRespDTO.builder()
                .evaluationId(evaluation.getEvaluationId())
                .submissionId(evaluation.getSubmissionId())
                .evaluatorId(evaluation.getEvaluatorId())
                .marks(evaluation.getMarks())
                .feedback(evaluation.getFeedback())
                .evaluatedAt(evaluation.getEvaluatedAt())
                .build();
    }
}
