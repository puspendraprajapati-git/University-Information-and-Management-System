package com.university.placement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlacementInterviewDTO {
    private Long interviewId;
    private Long applicationId;
    private Long studentId;
    private String studentName;
    private String enrollmentNo;
    private String departmentName;

    private Long openingId;
    private String jobTitle;
    private String companyName;

    private String interviewRound;
    private LocalDateTime scheduledAt;
    private String venueOrLink;
    private String mode;
    private String result;
    private String remarks;
}
