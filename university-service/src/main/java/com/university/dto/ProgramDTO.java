package com.university.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProgramDTO {

    private Long programId;

    @NotBlank(message = "Program code is required")
    private String programCode;

    @NotBlank(message = "Program name is required")
    private String programName;

    private String degreeType;

    private Integer durationYears;

    @NotNull(message = "Department ID is required")
    private Long departmentId;
}
