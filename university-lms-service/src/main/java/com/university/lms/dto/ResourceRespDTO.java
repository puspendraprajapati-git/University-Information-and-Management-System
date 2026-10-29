package com.university.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceRespDTO {

    private Long resourceId;
    private Long subjectId;
    private Long uploadedBy;
    private String title;
    private String fileName;
    private String resourceType;
    private String downloadUrl;
    private LocalDateTime uploadedAt;
}
