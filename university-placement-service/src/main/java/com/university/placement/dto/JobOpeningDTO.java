package com.university.placement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobOpeningDTO {
    private Long openingId;
    private Long companyId;
    private String companyName;
    private String companyIndustry;
    private String companyWebsite;
    private String companyLogoUrl;

    private String title;
    private String jobDescription;
    private String eligibility;
    private BigDecimal packageLpa;
    private LocalDate deadline;
    private String jobType;
    private String location;
    private BigDecimal minCgpa;
    private String allowedBranches;
    private Boolean isActive;
    private LocalDateTime createdAt;

    // Student specific context (optional)
    private Long applicantCount;
    private Boolean isApplied;
    private String applicationStatus;
    private Boolean isEligible;
    private String eligibilityReason;
}
