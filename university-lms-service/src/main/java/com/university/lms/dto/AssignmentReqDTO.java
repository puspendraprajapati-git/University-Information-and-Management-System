package com.university.lms.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentReqDTO {

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    @NotNull(message = "Faculty ID is required")
    private Long facultyId;

    @NotBlank(message = "Assignment title is required")
    private String title;

    private String description;

    @JsonFormat(pattern = "yyyy-MM-dd['T'][ ]HH:mm[:ss]")
    private LocalDateTime dueDate;

    private Integer maxMarks;
}
