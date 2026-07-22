package com.university.repository;

import com.university.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResultRepository extends JpaRepository<Result, Long> {
    List<Result> findByStudent_StudentId(Long studentId);
    List<Result> findByStudent_StudentIdAndSemester_SemesterId(Long studentId, Long semesterId);
}