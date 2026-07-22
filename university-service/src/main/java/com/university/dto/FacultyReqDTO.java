package com.university.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FacultyReqDTO {

    @NotNull(message = "User id is required (must be an existing user with role FACULTY)")
    private Long userId;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotNull(message = "Department id is required")
    private Long deptId;

    private String qualification;
}