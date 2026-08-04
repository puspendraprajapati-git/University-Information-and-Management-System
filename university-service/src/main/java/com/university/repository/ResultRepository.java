package com.university.repository;

import com.university.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResultRepository extends JpaRepository<Result, Long> {
    List<Result> findByStudent_Id(Long studentId);
    List<Result> findByStudent_IdAndSemester_Id(Long studentId, Long semesterId);
}