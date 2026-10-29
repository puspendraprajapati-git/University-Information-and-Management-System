package com.university.placement.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "placement_interviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PlacementInterview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interview_id")
    private Long interviewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private JobApplication application;

    @Column(name = "interview_round", length = 50)
    private String interviewRound; // Technical, HR, Group Discussion, etc.

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "venue_or_link", length = 300)
    private String venueOrLink;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode", length = 20)
    @Builder.Default
    private InterviewMode mode = InterviewMode.OFFLINE;

    @Enumerated(EnumType.STRING)
    @Column(name = "result", length = 20)
    private InterviewResult result;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    public enum InterviewMode {
        ONLINE, OFFLINE
    }

    public enum InterviewResult {
        PENDING, PASS, FAIL
    }
}
