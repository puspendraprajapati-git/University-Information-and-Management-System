package com.university.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubjectReqDTO {

    @NotBlank(message = "Subject code is required")
    private String subjectCode;

    @NotBlank(message = "Subject name is required")
    private String subjectName;

    @NotNull(message = "Semester id is required")
    private Long semesterId;

    @NotNull(message = "Department id is required")
    private Long deptId;

    private String syllabusPath;

    private Integer credits;
}