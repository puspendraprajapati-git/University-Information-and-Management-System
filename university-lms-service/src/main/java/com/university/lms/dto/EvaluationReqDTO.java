package com.university.lms.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationReqDTO {

    @NotNull(message = "Submission ID is required")
    private Long submissionId;

    @NotNull(message = "Evaluator ID is required")
    private Long evaluatorId;

    @NotNull(message = "Marks are required")
    private Integer marks;

    private String feedback;
}
