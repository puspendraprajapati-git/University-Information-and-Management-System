package com.university.entity;


import java.util.List;

import com.university.enums.FacultyType;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "faculties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Faculty {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    /*
       Faculty is linked with User table

       One User can have one Faculty profile
    */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true
    )
    private User user;



    /*
       Faculty belongs to Department

       Example:
       Computer Science Department
       Electronics Department
    */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "department_id",
            nullable = false
    )
    private Department department;



    @Column(nullable = false)
    private String employeeCode;



    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FacultyType facultyType;



    @Column(nullable = false)
    private String qualification;



    private Integer experience;



    private String specialization;
    @OneToMany(
            mappedBy = "faculty",
            cascade = CascadeType.ALL
    )
    @Builder.Default
    private List<Subject> subjects = new ArrayList<>();

    @OneToMany(
            mappedBy = "faculty",
            cascade = CascadeType.ALL
    )
    @Builder.Default
    private List<Attendance> attendances = new ArrayList<>();
    
    
}