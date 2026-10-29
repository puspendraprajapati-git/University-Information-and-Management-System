package com.university.exam.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "exams")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long examId;

    @Column(name = "subject_id", nullable = false)
    private Long subjectId;

    @Column(name = "semester_id", nullable = false)
    private Long semesterId;

    @Column(name = "exam_type", nullable = false, length = 50)
    private String examType; // MID_TERM, FINAL, PRACTICAL, QUIZ

    @Column(name = "exam_date", nullable = false)
    private LocalDate examDate;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "total_marks")
    private Integer totalMarks;

    @Column(name = "exam_name")
    private String examName;

    @Column(name = "max_marks")
    private Integer maxMarks;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (totalMarks == null) {
            totalMarks = 100;
        }
        if (maxMarks == null) {
            maxMarks = totalMarks;
        }
        if (examName == null) {
            examName = (examType != null ? examType : "Semester") + " Exam";
        }
    }
}
