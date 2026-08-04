package com.university.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "faculty")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Faculty extends BaseEntity {

    @OneToOne
    @JoinColumn(name = "user_id")
    private Users user;

    @Column(nullable = false)
    private String fullName;

    @ManyToOne
    @JoinColumn(name = "dept_id", nullable = false)
    private Department department;

    private String qualification;

    @OneToMany(mappedBy = "faculty", cascade = CascadeType.ALL)
    private List<Attendance> attendanceMarked;

    @OneToMany(mappedBy = "organizer", cascade = CascadeType.ALL)
    private List<Event> eventsOrganized;
}