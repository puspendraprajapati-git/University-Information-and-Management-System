package com.university.lms.dto;

import com.university.lms.entity.SubmissionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionRespDTO {

    private Long submissionId;
    private Long assignmentId;
    private String assignmentTitle;
    private Long studentId;
    private String fileName;
    private String downloadUrl;
    private LocalDateTime submittedAt;
    private SubmissionStatus status;

    // Evaluation details (if evaluated)
    private Long evaluationId;
    private Long evaluatorId;
    private Integer marks;
    private Integer maxMarks;
    private String feedback;
    private LocalDateTime evaluatedAt;
}
