package com.university.exam.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamDTO {
    private Long examId;
    private Long subjectId;
    private String subjectName;
    private String subjectCode;
    private Long semesterId;
    private String semesterName;
    private String examType;
    private LocalDate examDate;
    private Integer durationMinutes;
    private Integer totalMarks;

    // Schedule details if scheduled
    private Long scheduleId;
    private Long roomId;
    private String roomName;
    private String building;
    private LocalTime startTime;
    private LocalTime endTime;
}
