package com.university.placement.dto;

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
public class StudentEligibilityDTO {
    private Long studentId;
    private String studentName;
    private String enrollmentNo;
    private String departmentName;
    private Integer currentSemester;
    private BigDecimal cgpa;
    private boolean eligible;
    private List<String> reasons;
}
