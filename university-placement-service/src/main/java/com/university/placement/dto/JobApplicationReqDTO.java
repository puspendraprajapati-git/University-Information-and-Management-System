package com.university.placement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class JobApplicationReqDTO {

    @NotNull(message = "Opening ID is required")
    private Long openingId;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    private String resumeUrl;
    private String coverLetter;
}
