package com.university.placement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class JobOpeningReqDTO {

    @NotNull(message = "Company ID is required")
    private Long companyId;

    @NotBlank(message = "Job title is required")
    private String title;

    private String jobDescription;
    private String eligibility;

    private BigDecimal packageLpa;
    private LocalDate deadline;
    private String jobType = "Full-Time";
    private String location = "Campus / Hybrid";
    private BigDecimal minCgpa;
    private String allowedBranches;
    private Boolean isActive = true;
}
