package com.university.placement.service;

import com.university.placement.dto.CompanyDTO;
import com.university.placement.entity.Company;
import com.university.placement.repository.CompanyRepository;
import com.university.placement.repository.JobOpeningRepository;
import com.university.placement.repository.PlacementDriveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final JobOpeningRepository jobOpeningRepository;
    private final PlacementDriveRepository driveRepository;

    public List<CompanyDTO> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CompanyDTO getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with ID: " + id));
        return mapToDTO(company);
    }

    @Transactional
    public Company createCompany(Company company) {
        if (company.getName() == null || company.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Company name cannot be blank");
        }
        return companyRepository.save(company);
    }

    @Transactional
    public Company updateCompany(Long id, Company details) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with ID: " + id));

        company.setName(details.getName());
        company.setIndustry(details.getIndustry());
        company.setWebsite(details.getWebsite());
        company.setLogoUrl(details.getLogoUrl());
        company.setDescription(details.getDescription());
        company.setHrContactName(details.getHrContactName());
        company.setHrContactEmail(details.getHrContactEmail());

        return companyRepository.save(company);
    }

    @Transactional
    public void deleteCompany(Long id) {
        if (!companyRepository.existsById(id)) {
            throw new RuntimeException("Company not found with ID: " + id);
        }
        companyRepository.deleteById(id);
    }

    private CompanyDTO mapToDTO(Company company) {
        long activeJobs = jobOpeningRepository.findByCompany_CompanyId(company.getCompanyId())
                .stream().filter(j -> Boolean.TRUE.equals(j.getIsActive())).count();
        long totalDrives = driveRepository.findByCompany_CompanyId(company.getCompanyId()).size();

        return CompanyDTO.builder()
                .companyId(company.getCompanyId())
                .name(company.getName())
                .industry(company.getIndustry())
                .website(company.getWebsite())
                .logoUrl(company.getLogoUrl())
                .description(company.getDescription())
                .hrContactName(company.getHrContactName())
                .hrContactEmail(company.getHrContactEmail())
                .activeJobsCount(activeJobs)
                .totalDrivesCount(totalDrives)
                .build();
    }
}
