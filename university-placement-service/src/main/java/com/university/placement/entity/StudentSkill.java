package com.university.placement.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "skill_id")
    private Long skillId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "skill_name", nullable = false, length = 100)
    private String skillName;

    @Column(name = "proficiency_level", length = 50)
    @Builder.Default
    private String proficiencyLevel = "INTERMEDIATE";

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    public enum Proficiency {
        BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    }
}
