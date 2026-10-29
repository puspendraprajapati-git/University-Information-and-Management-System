package com.university.placement.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_openings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class JobOpening {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "opening_id")
    private Long openingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "job_description", columnDefinition = "TEXT")
    private String jobDescription;

    @Column(name = "eligibility", columnDefinition = "TEXT")
    private String eligibility;

    @Column(name = "package_lpa", precision = 5, scale = 2)
    private BigDecimal packageLpa;

    @Column(name = "deadline")
    private LocalDate deadline;

    @Column(name = "job_type", length = 50)
    private String jobType; // Full-Time, Internship, Contract

    @Column(name = "location", length = 150)
    private String location;

    @Column(name = "min_cgpa", precision = 3, scale = 2)
    private BigDecimal minCgpa;

    @Column(name = "allowed_branches", columnDefinition = "TEXT")
    private String allowedBranches;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
