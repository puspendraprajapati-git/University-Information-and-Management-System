package com.university.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "semesters")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Semester extends BaseEntity {

    @Column(nullable = false)
    private String semesterName;

    private LocalDate startDate;
    private LocalDate endDate;
    private Integer year;

    @OneToMany(mappedBy = "semester", cascade = CascadeType.ALL)
    private List<Subject> subjects;

    @OneToMany(mappedBy = "semester", cascade = CascadeType.ALL)
    private List<Attendance> attendanceList;

    @OneToMany(mappedBy = "semester", cascade = CascadeType.ALL)
    private List<Result> results;
}