package com.university.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student extends BaseEntity {

    @OneToOne
    @JoinColumn(name = "user_id")
    private Users user;

    @Column(nullable = false, unique = true)
    private String enrollmentNo;

    @Column(nullable = false)
    private String fullName;

    @ManyToOne
    @JoinColumn(name = "dept_id", nullable = false)
    private Department department;

    private Integer currentSemester;

    private LocalDate dateOfBirth;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<Attendance> attendanceList;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<Result> results;
}