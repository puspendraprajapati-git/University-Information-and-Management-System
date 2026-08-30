package com.university.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "subjects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String subjectCode;

    @Column(nullable = false)
    private String subjectName;

    @ManyToOne
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    @ManyToOne
    @JoinColumn(name = "dept_id", nullable = false)
    private Department department;

    private String syllabusPath;

    private Integer credits;

    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL)
    private List<Attendance> attendanceList;

    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL)
    private List<Result> results;
}