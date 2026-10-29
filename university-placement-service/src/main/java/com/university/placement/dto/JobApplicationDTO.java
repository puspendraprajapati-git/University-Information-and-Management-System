package com.university.placement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationDTO {
    private Long applicationId;

    // Job details
    private Long openingId;
    private String jobTitle;
    private Long companyId;
    private String companyName;
    private BigDecimal packageLpa;
    private String jobType;

    // Student details
    private Long studentId;
    private String studentName;
    private String enrollmentNo;
    private String departmentName;
    private Integer currentSemester;
    private BigDecimal studentCgpa;

    // Application details
    private LocalDateTime appliedAt;
    private String status;
    private String resumeUrl;
    private String coverLetter;
    private String feedback;

    // Attached interview rounds
    private List<PlacementInterviewDTO> interviews;
}
