package com.university.placement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDTO {
    private Long companyId;
    private String name;
    private String industry;
    private String website;
    private String logoUrl;
    private String description;
    private String hrContactName;
    private String hrContactEmail;
    private Long activeJobsCount;
    private Long totalDrivesCount;
}
