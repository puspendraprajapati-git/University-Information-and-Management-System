package com.university.entity;


import java.time.LocalDate;

import com.university.enums.AttendanceStatus;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(
        name = "attendance",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "student_id",
                                "subject_id",
                                "attendance_date"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    /*
        Student whose attendance is recorded

        Example:
        Vikash -> DBMS -> Present
    */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "student_id",
            nullable = false
    )
    private Student student;



    /*
        Subject for which attendance is marked

        Example:
        Database Management System
    */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "subject_id",
            nullable = false
    )
    private Subject subject;



    /*
        Faculty who marked attendance
    */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "faculty_id",
            nullable = false
    )
    private Faculty faculty;



    @Column(
            name = "attendance_date",
            nullable = false
    )
    private LocalDate attendanceDate;



    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;



    private String remarks;

}