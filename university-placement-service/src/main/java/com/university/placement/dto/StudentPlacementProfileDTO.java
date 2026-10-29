package com.university.placement.dto;

import com.university.placement.entity.StudentSkill;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentPlacementProfileDTO {
    private Long studentId;
    private String studentName;
    private String enrollmentNo;
    private String departmentName;
    private Integer currentSemester;
    private BigDecimal cgpa;

    private List<StudentSkill> skills;
    private List<JobApplicationDTO> applications;
    private List<PlacementInterviewDTO> upcomingInterviews;
    private List<JobOpeningDTO> recommendedJobs;

    private Long totalApplications;
    private Long totalShortlisted;
    private Long totalInterviews;
    private Long totalOffers;
}
