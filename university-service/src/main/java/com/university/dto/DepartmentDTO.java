package com.university.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentDTO {

    private Long deptId;

    @NotBlank(message = "Department name is required")
    private String deptName;

    @NotBlank(message = "Department code is required")
    private String deptCode;

    private Long hodId;
}