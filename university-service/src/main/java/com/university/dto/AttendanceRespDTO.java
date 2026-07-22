package com.university.dto;

import com.university.enums.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRespDTO {

    private Long attendanceId;
    private Long studentId;
    private String studentName;
    private Long subjectId;
    private String subjectName;
    private Long facultyId;
    private String facultyName;
    private Long semesterId;
    private String semesterName;
    private LocalDate attendanceDate;
    private AttendanceStatus status;
}