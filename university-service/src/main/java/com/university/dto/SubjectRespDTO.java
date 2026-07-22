package com.university.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubjectRespDTO {

    private Long subjectId;
    private String subjectCode;
    private String subjectName;
    private Long semesterId;
    private String semesterName;
    private Long deptId;
    private String deptName;
    private String syllabusPath;
    private Integer credits;
}