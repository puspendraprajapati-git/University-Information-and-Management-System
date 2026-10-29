package com.university.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationRespDTO {

    private Long evaluationId;
    private Long submissionId;
    private Long evaluatorId;
    private Integer marks;
    private String feedback;
    private LocalDateTime evaluatedAt;
}
