package com.university.placement.repository;

import com.university.placement.entity.JobOpening;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobOpeningRepository extends JpaRepository<JobOpening, Long> {

    List<JobOpening> findByIsActiveTrue();

    List<JobOpening> findByCompany_CompanyId(Long companyId);

    List<JobOpening> findByJobType(String jobType);
}
