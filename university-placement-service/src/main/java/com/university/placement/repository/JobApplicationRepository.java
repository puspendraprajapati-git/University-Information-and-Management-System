package com.university.placement.repository;

import com.university.placement.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByStudentId(Long studentId);

    List<JobApplication> findByOpening_OpeningId(Long openingId);

    Optional<JobApplication> findByOpening_OpeningIdAndStudentId(Long openingId, Long studentId);

    boolean existsByOpening_OpeningIdAndStudentId(Long openingId, Long studentId);

    List<JobApplication> findByStudentIdAndStatus(Long studentId, JobApplication.ApplicationStatus status);

    long countByOpening_OpeningId(Long openingId);
}
