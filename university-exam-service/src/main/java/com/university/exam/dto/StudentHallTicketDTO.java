package com.university.exam.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentHallTicketDTO {
    private Long registrationId;
    private Long examId;
    private String subjectName;
    private String subjectCode;
    private String examType;
    private LocalDate examDate;
    private Integer durationMinutes;
    private Integer totalMarks;

    // Room & Seating
    private String roomName;
    private String building;
    private String seatNumber;
    private LocalTime startTime;
    private LocalTime endTime;
    private String registrationStatus;

    // Connected Exam Result (if already published)
    private Double marksObtained;
    private String grade;
    private Boolean isResultPublished;
}
