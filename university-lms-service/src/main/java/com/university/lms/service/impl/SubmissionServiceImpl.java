package com.university.lms.service.impl;

import com.university.lms.dto.SubmissionRespDTO;
import com.university.lms.entity.Assignment;
import com.university.lms.entity.AssignmentEvaluation;
import com.university.lms.entity.AssignmentSubmission;
import com.university.lms.entity.SubmissionStatus;
import com.university.lms.exception.ResourceNotFoundException;
import com.university.lms.repository.AssignmentRepository;
import com.university.lms.repository.EvaluationRepository;
import com.university.lms.repository.SubmissionRepository;
import com.university.lms.service.FileStorageService;
import com.university.lms.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SubmissionServiceImpl implements SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final EvaluationRepository evaluationRepository;
    private final FileStorageService fileStorageService;

    @Override
    public SubmissionRespDTO submitAssignment(Long assignmentId, Long studentId, MultipartFile file) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + assignmentId));

        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "submission";
        String storedFilePath = fileStorageService.storeFile(file, "submissions");

        SubmissionStatus status = SubmissionStatus.SUBMITTED;
        if (assignment.getDueDate() != null && LocalDateTime.now().isAfter(assignment.getDueDate())) {
            status = SubmissionStatus.LATE;
        }

        // Check if student already submitted this assignment
        Optional<AssignmentSubmission> existingOpt =
                submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId);

        AssignmentSubmission submission;
        if (existingOpt.isPresent()) {
            submission = existingOpt.get();
            // delete old file if it exists
            if (submission.getFilePath() != null) {
                fileStorageService.deleteFile(submission.getFilePath());
            }
            submission.setFilePath(storedFilePath);
            submission.setFileName(originalName);
            submission.setStatus(status);
        } else {
            submission = AssignmentSubmission.builder()
                    .assignmentId(assignmentId)
                    .studentId(studentId)
                    .filePath(storedFilePath)
                    .fileName(originalName)
                    .status(status)
                    .build();
        }

        AssignmentSubmission saved = submissionRepository.save(submission);
        return mapToDTO(saved, assignment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionRespDTO> getSubmissionsByAssignment(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + assignmentId));

        return submissionRepository.findByAssignmentIdOrderBySubmittedAtDesc(assignmentId)
                .stream()
                .map(sub -> mapToDTO(sub, assignment))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionRespDTO> getSubmissionsByStudent(Long studentId) {
        return submissionRepository.findByStudentIdOrderBySubmittedAtDesc(studentId)
                .stream()
                .map(sub -> {
                    Assignment assignment = assignmentRepository.findById(sub.getAssignmentId()).orElse(null);
                    return mapToDTO(sub, assignment);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SubmissionRespDTO getSubmissionById(Long submissionId) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with id: " + submissionId));
        Assignment assignment = assignmentRepository.findById(submission.getAssignmentId()).orElse(null);
        return mapToDTO(submission, assignment);
    }

    @Override
    @Transactional(readOnly = true)
    public Resource getSubmissionFile(Long submissionId) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with id: " + submissionId));
        return fileStorageService.loadFileAsResource(submission.getFilePath());
    }

    @Override
    @Transactional(readOnly = true)
    public String getSubmissionOriginalFileName(Long submissionId) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with id: " + submissionId));
        return submission.getFileName() != null ? submission.getFileName() : "download";
    }

    private SubmissionRespDTO mapToDTO(AssignmentSubmission sub, Assignment assignment) {
        Optional<AssignmentEvaluation> evalOpt = evaluationRepository.findBySubmissionId(sub.getSubmissionId());

        SubmissionRespDTO.SubmissionRespDTOBuilder builder = SubmissionRespDTO.builder()
                .submissionId(sub.getSubmissionId())
                .assignmentId(sub.getAssignmentId())
                .assignmentTitle(assignment != null ? assignment.getTitle() : "Assignment #" + sub.getAssignmentId())
                .studentId(sub.getStudentId())
                .fileName(sub.getFileName())
                .downloadUrl("/lms/submissions/download/" + sub.getSubmissionId())
                .submittedAt(sub.getSubmittedAt())
                .status(sub.getStatus());

        if (assignment != null) {
            builder.maxMarks(assignment.getMaxMarks());
        }

        if (evalOpt.isPresent()) {
            AssignmentEvaluation eval = evalOpt.get();
            builder.evaluationId(eval.getEvaluationId())
                    .evaluatorId(eval.getEvaluatorId())
                    .marks(eval.getMarks())
                    .feedback(eval.getFeedback())
                    .evaluatedAt(eval.getEvaluatedAt());
        }

        return builder.build();
    }
}
