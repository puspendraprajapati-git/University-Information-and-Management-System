package com.university.dto;

import com.university.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AttendanceReqDTO {

    @NotNull(message = "Student id is required")
    private Long studentId;

    @NotNull(message = "Subject id is required")
    private Long subjectId;

    @NotNull(message = "Faculty id is required")
    private Long facultyId;

    @NotNull(message = "Semester id is required")
    private Long semesterId;

    @NotNull(message = "Attendance date is required")
    private LocalDate attendanceDate;

    @NotNull(message = "Status is required")
    private AttendanceStatus status;
}