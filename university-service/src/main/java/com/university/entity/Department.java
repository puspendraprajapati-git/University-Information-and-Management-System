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
public class Department extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String deptName;

    @Column(nullable = false, unique = true)
    private String deptCode;

    // hod references a Faculty member, mapped as a nullable relationship
    // to allow creating the department first, then updating with HOD later.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hod_id")
    private Faculty hod;

    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL)
    private List<Student> students;

    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL)
    private List<Faculty> facultyList;

    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL)
    private List<Subject> subjects;
}