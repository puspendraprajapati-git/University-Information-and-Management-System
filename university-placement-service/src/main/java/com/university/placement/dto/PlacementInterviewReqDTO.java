package com.university.placement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PlacementInterviewReqDTO {

    @NotNull(message = "Application ID is required")
    private Long applicationId;

    @NotBlank(message = "Interview round is required")
    private String interviewRound;

    private LocalDateTime scheduledAt;
    private String venueOrLink;
    private String mode = "OFFLINE";
    private String result = "PENDING";
    private String remarks;
}
