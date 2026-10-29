package com.university.placement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlacementDriveDTO {
    private Long driveId;
    private Long companyId;
    private String companyName;
    private String companyWebsite;
    private String companyIndustry;
    private String companyLogoUrl;

    private LocalDate driveDate;
    private String venue;
    private String status;
    private String description;
    private String roundsInfo;
    private LocalDateTime createdAt;
}
