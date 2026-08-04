package com.university.entity;

import com.university.enums.EventType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    private LocalDate eventDate;

    private String venue;

    @ManyToOne
    @JoinColumn(name = "organizer_id", nullable = false)
    private Faculty organizer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType type;

    private String filePath;
}