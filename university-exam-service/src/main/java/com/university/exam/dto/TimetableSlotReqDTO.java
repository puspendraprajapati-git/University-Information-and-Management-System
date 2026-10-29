package com.university.exam.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimetableSlotReqDTO {
    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    @NotNull(message = "Faculty ID is required")
    private Long facultyId;

    @NotNull(message = "Semester ID is required")
    private Long semesterId;

    @NotNull(message = "Room ID is required")
    private Long roomId;

    @NotNull(message = "Day of week is required")
    private String dayOfWeek;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;
}
