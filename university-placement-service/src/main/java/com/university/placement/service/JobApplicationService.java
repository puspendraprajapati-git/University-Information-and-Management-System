package com.university.placement.service;

import com.university.placement.dto.JobApplicationDTO;
import com.university.placement.dto.JobApplicationReqDTO;
import com.university.placement.dto.PlacementInterviewDTO;
import com.university.placement.dto.StudentEligibilityDTO;
import com.university.placement.entity.*;
import com.university.placement.repository.JobApplicationRepository;
import com.university.placement.repository.JobOpeningRepository;
import com.university.placement.repository.PlacementInterviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final JobOpeningRepository jobOpeningRepository;
    private final PlacementInterviewRepository interviewRepository;
    private final StudentPlacementService studentPlacementService;

    @Transactional
    public JobApplication applyForJob(JobApplicationReqDTO dto) {
        JobOpening opening = jobOpeningRepository.findById(dto.getOpeningId())
                .orElseThrow(() -> new RuntimeException("Job opening not found: " + dto.getOpeningId()));

        if (Boolean.FALSE.equals(opening.getIsActive())) {
            throw new IllegalStateException("This job opening is no longer accepting applications.");
        }

        // Check if student already applied
        if (applicationRepository.existsByOpening_OpeningIdAndStudentId(dto.getOpeningId(), dto.getStudentId())) {
            throw new IllegalStateException("You have already submitted an application for this position.");
        }

        // Check academic eligibility rules
        StudentEligibilityDTO eligibility = studentPlacementService.checkStudentEligibility(dto.getStudentId(), opening);
        if (!eligibility.isEligible()) {
            throw new IllegalStateException("Eligibility criteria not met: " + String.join(", ", eligibility.getReasons()));
        }

        JobApplication application = JobApplication.builder()
                .opening(opening)
                .studentId(dto.getStudentId())
                .resumeUrl(dto.getResumeUrl())
                .coverLetter(dto.getCoverLetter())
                .status(JobApplication.ApplicationStatus.APPLIED)
                .build();

        return applicationRepository.save(application);
    }

    public List<JobApplicationDTO> getApplicationsForOpening(Long openingId) {
        List<JobApplication> apps = applicationRepository.findByOpening_OpeningId(openingId);
        return apps.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<JobApplicationDTO> getApplicationsByStudent(Long studentId) {
        List<JobApplication> apps = applicationRepository.findByStudentId(studentId);
        return apps.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public JobApplicationDTO getApplicationById(Long applicationId) {
        JobApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found: " + applicationId));
        return mapToDTO(app);
    }

    @Transactional
    public JobApplication updateApplicationStatus(Long applicationId, String statusStr, String feedback) {
        JobApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found: " + applicationId));

        try {
            JobApplication.ApplicationStatus status = JobApplication.ApplicationStatus.valueOf(statusStr.toUpperCase());
            app.setStatus(status);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid application status: " + statusStr);
        }

        if (feedback != null) {
            app.setFeedback(feedback);
        }

        return applicationRepository.save(app);
    }

    private JobApplicationDTO mapToDTO(JobApplication app) {
        JobOpening opening = app.getOpening();
        Company company = opening.getCompany();

        StudentEligibilityDTO academicInfo = null;
        try {
            academicInfo = studentPlacementService.getStudentAcademicInfo(app.getStudentId());
        } catch (Exception ignored) {}

        List<PlacementInterview> interviews = interviewRepository.findByApplication_ApplicationId(app.getApplicationId());
        List<PlacementInterviewDTO> interviewDTOs = interviews.stream()
                .map(this::mapInterviewToDTO)
                .collect(Collectors.toList());

        return JobApplicationDTO.builder()
                .applicationId(app.getApplicationId())
                .openingId(opening.getOpeningId())
                .jobTitle(opening.getTitle())
                .companyId(company.getCompanyId())
                .companyName(company.getName())
                .packageLpa(opening.getPackageLpa())
                .jobType(opening.getJobType())
                .studentId(app.getStudentId())
                .studentName(academicInfo != null ? academicInfo.getStudentName() : "Student #" + app.getStudentId())
                .enrollmentNo(academicInfo != null ? academicInfo.getEnrollmentNo() : "-")
                .departmentName(academicInfo != null ? academicInfo.getDepartmentName() : "-")
                .currentSemester(academicInfo != null ? academicInfo.getCurrentSemester() : 1)
                .studentCgpa(academicInfo != null ? academicInfo.getCgpa() : null)
                .appliedAt(app.getAppliedAt())
                .status(app.getStatus().name())
                .resumeUrl(app.getResumeUrl())
                .coverLetter(app.getCoverLetter())
                .feedback(app.getFeedback())
                .interviews(interviewDTOs)
                .build();
    }

    private PlacementInterviewDTO mapInterviewToDTO(PlacementInterview interview) {
        JobApplication app = interview.getApplication();
        JobOpening opening = app.getOpening();
        Company company = opening.getCompany();

        return PlacementInterviewDTO.builder()
                .interviewId(interview.getInterviewId())
                .applicationId(app.getApplicationId())
                .studentId(app.getStudentId())
                .jobTitle(opening.getTitle())
                .companyName(company.getName())
                .interviewRound(interview.getInterviewRound())
                .scheduledAt(interview.getScheduledAt())
                .venueOrLink(interview.getVenueOrLink())
                .mode(interview.getMode() != null ? interview.getMode().name() : "OFFLINE")
                .result(interview.getResult() != null ? interview.getResult().name() : "PENDING")
                .remarks(interview.getRemarks())
                .build();
    }
}
