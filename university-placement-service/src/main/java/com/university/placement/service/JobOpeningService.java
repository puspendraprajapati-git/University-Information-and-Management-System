package com.university.placement.service;

import com.university.placement.dto.JobOpeningDTO;
import com.university.placement.dto.JobOpeningReqDTO;
import com.university.placement.dto.StudentEligibilityDTO;
import com.university.placement.entity.Company;
import com.university.placement.entity.JobApplication;
import com.university.placement.entity.JobOpening;
import com.university.placement.repository.CompanyRepository;
import com.university.placement.repository.JobApplicationRepository;
import com.university.placement.repository.JobOpeningRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobOpeningService {

    private final JobOpeningRepository jobOpeningRepository;
    private final CompanyRepository companyRepository;
    private final JobApplicationRepository applicationRepository;
    private final StudentPlacementService studentPlacementService;
    private final JdbcTemplate jdbcTemplate;

    public List<JobOpeningDTO> getAllOpenings(Long studentId) {
        List<JobOpening> openings = jobOpeningRepository.findAll();
        return openings.stream()
                .map(job -> mapToDTO(job, studentId))
                .collect(Collectors.toList());
    }

    public List<JobOpeningDTO> getActiveOpenings(Long studentId) {
        List<JobOpening> openings = jobOpeningRepository.findByIsActiveTrue();
        return openings.stream()
                .map(job -> mapToDTO(job, studentId))
                .collect(Collectors.toList());
    }

    public JobOpeningDTO getOpeningById(Long openingId, Long studentId) {
        JobOpening job = jobOpeningRepository.findById(openingId)
                .orElseThrow(() -> new RuntimeException("Job opening not found: " + openingId));
        return mapToDTO(job, studentId);
    }

    @Transactional
    public JobOpening createOpening(JobOpeningReqDTO dto) {
        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found with ID: " + dto.getCompanyId()));

        JobOpening opening = JobOpening.builder()
                .company(company)
                .title(dto.getTitle())
                .jobDescription(dto.getJobDescription())
                .eligibility(dto.getEligibility())
                .packageLpa(dto.getPackageLpa())
                .deadline(dto.getDeadline())
                .jobType(dto.getJobType())
                .location(dto.getLocation())
                .minCgpa(dto.getMinCgpa())
                .allowedBranches(dto.getAllowedBranches())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();

        return jobOpeningRepository.save(opening);
    }

    @Transactional
    public JobOpening updateOpening(Long id, JobOpeningReqDTO dto) {
        JobOpening opening = jobOpeningRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job opening not found: " + id));

        if (dto.getCompanyId() != null) {
            Company company = companyRepository.findById(dto.getCompanyId())
                    .orElseThrow(() -> new RuntimeException("Company not found: " + dto.getCompanyId()));
            opening.setCompany(company);
        }

        opening.setTitle(dto.getTitle());
        opening.setJobDescription(dto.getJobDescription());
        opening.setEligibility(dto.getEligibility());
        opening.setPackageLpa(dto.getPackageLpa());
        opening.setDeadline(dto.getDeadline());
        opening.setJobType(dto.getJobType());
        opening.setLocation(dto.getLocation());
        opening.setMinCgpa(dto.getMinCgpa());
        opening.setAllowedBranches(dto.getAllowedBranches());
        if (dto.getIsActive() != null) {
            opening.setIsActive(dto.getIsActive());
        }

        return jobOpeningRepository.save(opening);
    }

    @Transactional
    public void deleteOpening(Long id) {
        if (!jobOpeningRepository.existsById(id)) {
            throw new RuntimeException("Job opening not found: " + id);
        }
        jobOpeningRepository.deleteById(id);
    }

    /**
     * Filter students in university who meet academic criteria for this job opening
     */
    public List<StudentEligibilityDTO> getEligibleStudentsForJob(Long openingId) {
        JobOpening job = jobOpeningRepository.findById(openingId)
                .orElseThrow(() -> new RuntimeException("Job opening not found: " + openingId));

        String allStudentsSql = "SELECT id FROM students ORDER BY id";
        List<Long> studentIds = jdbcTemplate.query(allStudentsSql, (rs, rowNum) -> rs.getLong("id"));

        List<StudentEligibilityDTO> list = new ArrayList<>();
        for (Long sId : studentIds) {
            try {
                StudentEligibilityDTO eligibility = studentPlacementService.checkStudentEligibility(sId, job);
                list.add(eligibility);
            } catch (Exception ignored) {}
        }
        return list;
    }

    private JobOpeningDTO mapToDTO(JobOpening job, Long studentId) {
        Company comp = job.getCompany();
        long count = applicationRepository.countByOpening_OpeningId(job.getOpeningId());

        JobOpeningDTO.JobOpeningDTOBuilder builder = JobOpeningDTO.builder()
                .openingId(job.getOpeningId())
                .companyId(comp.getCompanyId())
                .companyName(comp.getName())
                .companyIndustry(comp.getIndustry())
                .companyWebsite(comp.getWebsite())
                .companyLogoUrl(comp.getLogoUrl())
                .title(job.getTitle())
                .jobDescription(job.getJobDescription())
                .eligibility(job.getEligibility())
                .packageLpa(job.getPackageLpa())
                .deadline(job.getDeadline())
                .jobType(job.getJobType())
                .location(job.getLocation())
                .minCgpa(job.getMinCgpa())
                .allowedBranches(job.getAllowedBranches())
                .isActive(job.getIsActive())
                .createdAt(job.getCreatedAt())
                .applicantCount(count);

        if (studentId != null) {
            Optional<JobApplication> appOpt = applicationRepository.findByOpening_OpeningIdAndStudentId(job.getOpeningId(), studentId);
            builder.isApplied(appOpt.isPresent());
            if (appOpt.isPresent()) {
                builder.applicationStatus(appOpt.get().getStatus().name());
            }

            try {
                StudentEligibilityDTO elig = studentPlacementService.checkStudentEligibility(studentId, job);
                builder.isEligible(elig.isEligible());
                builder.eligibilityReason(String.join("; ", elig.getReasons()));
            } catch (Exception e) {
                builder.isEligible(true);
                builder.eligibilityReason("Open to candidates");
            }
        }

        return builder.build();
    }
}
