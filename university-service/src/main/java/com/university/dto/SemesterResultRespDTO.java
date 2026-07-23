package com.university.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SemesterResultRespDTO {

    private Long studentId;
    private String studentName;
    private Long semesterId;
    private String semesterName;
    private List<ResultRespDTO> subjectResults;
    private Double gpa;
}