package com.university.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResultRespDTO {

    private Long resultId;
    private Long studentId;
    private String studentName;
    private Long subjectId;
    private String subjectName;
    private Long semesterId;
    private String semesterName;
    private Integer theoryMarks;
    private Integer practicalMarks;
    private Integer totalMarks;
    private String grade;
    private LocalDate resultDate;
}