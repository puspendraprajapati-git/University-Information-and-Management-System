package com.university.placement.repository;

import com.university.placement.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    List<Company> findByIndustryContainingIgnoreCase(String industry);

    boolean existsByNameIgnoreCase(String name);
}
