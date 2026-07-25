package com.university.entity;


import com.university.enums.SubjectType;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subjects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    @Column(nullable = false, unique = true)
    private String subjectCode;



    @Column(nullable = false)
    private String subjectName;



    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubjectType subjectType;



    @Column(nullable = false)
    private Integer credits;



    /*
       Subject belongs to Department

       Example:

       CSE Department
             |
             |
          DBMS Subject
    */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "department_id",
            nullable = false
    )
    private Department department;



    /*
       Subject belongs to Semester

       Example:

       Semester 5
            |
            |
           DBMS
    */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "semester_id",
            nullable = false
    )
    private Semester semester;



    /*
       Faculty teaching this subject

       Example:

       Prof. Sharma
             |
             |
            DBMS
    */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "faculty_id"
    )
    private Faculty faculty;

}