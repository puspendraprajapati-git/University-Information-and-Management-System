package com.university.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "departments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deptId;

    @Column(nullable = false, unique = true)
    private String deptName;

    @Column(nullable = false, unique = true)
    private String deptCode;

    // hod_id references a Faculty member - mapped as plain FK, not a relationship,
    // to avoid a circular dependency (Faculty already belongs to Department)
    private Long hodId;

    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL)
    private List<Student> students;

    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL)
    private List<Faculty> facultyList;

    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL)
    private List<Subject> subjects;
}