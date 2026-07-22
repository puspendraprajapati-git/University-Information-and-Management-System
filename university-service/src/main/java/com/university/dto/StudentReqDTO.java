package com.university.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class StudentReqDTO {

    @NotNull(message = "User id is required (must be an existing user with role STUDENT)")
    private Long userId;

    @NotBlank(message = "Enrollment number is required")
    private String enrollmentNo;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotNull(message = "Department id is required")
    private Long deptId;

    private Integer currentSemester;

    private LocalDate dateOfBirth;
}