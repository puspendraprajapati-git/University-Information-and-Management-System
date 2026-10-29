package com.university.exam.dto;

import lombok.*;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimetableSlotDTO {
    private Long slotId;
    private Long subjectId;
    private String subjectName;
    private String subjectCode;
    private Long facultyId;
    private String facultyName;
    private Long semesterId;
    private String semesterName;
    private Long roomId;
    private String roomName;
    private String building;
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
}
