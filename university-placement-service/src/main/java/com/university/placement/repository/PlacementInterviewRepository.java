package com.university.placement.repository;

import com.university.placement.entity.PlacementInterview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlacementInterviewRepository extends JpaRepository<PlacementInterview, Long> {

    List<PlacementInterview> findByApplication_ApplicationId(Long applicationId);

    List<PlacementInterview> findByApplication_StudentId(Long studentId);
}
