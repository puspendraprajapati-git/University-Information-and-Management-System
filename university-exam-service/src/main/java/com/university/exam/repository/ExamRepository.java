package com.university.exam.repository;

import com.university.exam.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findBySemesterId(Long semesterId);
    List<Exam> findBySubjectId(Long subjectId);
    List<Exam> findByExamType(String examType);
}
