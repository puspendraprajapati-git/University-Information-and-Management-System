package com.university.placement.service;

import com.university.placement.dto.PlacementInterviewDTO;
import com.university.placement.dto.PlacementInterviewReqDTO;
import com.university.placement.entity.Company;
import com.university.placement.entity.JobApplication;
import com.university.placement.entity.JobOpening;
import com.university.placement.entity.PlacementInterview;
import com.university.placement.repository.JobApplicationRepository;
import com.university.placement.repository.PlacementInterviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlacementInterviewService {

    private final PlacementInterviewRepository interviewRepository;
    private final JobApplicationRepository applicationRepository;

    @Transactional
    public PlacementInterview scheduleInterview(PlacementInterviewReqDTO dto) {
        JobApplication application = applicationRepository.findById(dto.getApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found: " + dto.getApplicationId()));

        PlacementInterview.InterviewMode mode = PlacementInterview.InterviewMode.OFFLINE;
        if (dto.getMode() != null) {
            try {
                mode = PlacementInterview.InterviewMode.valueOf(dto.getMode().toUpperCase());
            } catch (Exception ignored) {}
        }

        PlacementInterview interview = PlacementInterview.builder()
                .application(application)
                .interviewRound(dto.getInterviewRound())
                .scheduledAt(dto.getScheduledAt())
                .venueOrLink(dto.getVenueOrLink())
                .mode(mode)
                .result(PlacementInterview.InterviewResult.PENDING)
                .remarks(dto.getRemarks())
                .build();

        // Update application status to INTERVIEW_SCHEDULED if not already selected/rejected
        if (application.getStatus() == JobApplication.ApplicationStatus.APPLIED ||
            application.getStatus() == JobApplication.ApplicationStatus.SHORTLISTED) {
            application.setStatus(JobApplication.ApplicationStatus.INTERVIEW_SCHEDULED);
            applicationRepository.save(application);
        }

        return interviewRepository.save(interview);
    }

    @Transactional
    public PlacementInterview updateInterviewResult(Long interviewId, String resultStr, String remarks) {
        PlacementInterview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found: " + interviewId));

        if (resultStr != null) {
            try {
                PlacementInterview.InterviewResult res = PlacementInterview.InterviewResult.valueOf(resultStr.toUpperCase());
                interview.setResult(res);

                // If final round passed, officer can decide or automatically mark
                if (res == PlacementInterview.InterviewResult.PASS) {
                    JobApplication app = interview.getApplication();
                    // Keep application in positive track
                    if (app.getStatus() != JobApplication.ApplicationStatus.SELECTED) {
                        app.setStatus(JobApplication.ApplicationStatus.SHORTLISTED);
                        applicationRepository.save(app);
                    }
                }
            } catch (Exception ignored) {}
        }

        if (remarks != null) {
            interview.setRemarks(remarks);
        }

        return interviewRepository.save(interview);
    }

    public List<PlacementInterviewDTO> getInterviewsByStudent(Long studentId) {
        return interviewRepository.findByApplication_StudentId(studentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<PlacementInterviewDTO> getInterviewsByApplication(Long applicationId) {
        return interviewRepository.findByApplication_ApplicationId(applicationId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteInterview(Long id) {
        if (!interviewRepository.existsById(id)) {
            throw new RuntimeException("Interview not found: " + id);
        }
        interviewRepository.deleteById(id);
    }

    private PlacementInterviewDTO mapToDTO(PlacementInterview interview) {
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
