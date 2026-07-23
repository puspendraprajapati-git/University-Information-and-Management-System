package com.university.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResultReqDTO {

    @NotNull(message = "Student id is required")
    private Long studentId;

    @NotNull(message = "Subject id is required")
    private Long subjectId;

    @NotNull(message = "Semester id is required")
    private Long semesterId;

    @NotNull(message = "Theory marks are required")
    @Min(value = 0, message = "Theory marks cannot be negative")
    @Max(value = 100, message = "Theory marks cannot exceed 100")
    private Integer theoryMarks;

    @NotNull(message = "Practical marks are required")
    @Min(value = 0, message = "Practical marks cannot be negative")
    @Max(value = 100, message = "Practical marks cannot exceed 100")
    private Integer practicalMarks;
}