package com.university.dto;

import com.university.enums.EventType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EventReqDTO {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private LocalDate eventDate;

    private String venue;

    @NotNull(message = "Organizer (faculty) id is required")
    private Long organizerId;

    @NotNull(message = "Type is required (EVENT, NEWS, or SYLLABUS)")
    private EventType type;

    private String filePath;
}