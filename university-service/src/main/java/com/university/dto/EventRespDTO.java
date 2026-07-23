package com.university.dto;

import com.university.enums.EventType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventRespDTO {

    private Long eventId;
    private String title;
    private String description;
    private LocalDate eventDate;
    private String venue;
    private Long organizerId;
    private String organizerName;
    private EventType type;
    private String filePath;
}