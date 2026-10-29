package com.university.placement.controller;

import com.university.placement.dto.JobApplicationDTO;
import com.university.placement.dto.JobApplicationReqDTO;
import com.university.placement.entity.JobApplication;
import com.university.placement.service.JobApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/placement/applications", "/api/placement/applications"})
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService applicationService;

    /**
     * Students apply for a job opening. Academic criteria & eligibility rules are checked.
     */
    @PostMapping
    public ResponseEntity<?> applyForJob(@Valid @RequestBody JobApplicationReqDTO dto) {
        try {
            JobApplication app = applicationService.applyForJob(dto);
            return ResponseEntity.status(201).body(applicationService.getApplicationById(app.getApplicationId()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/opening/{openingId}")
    public ResponseEntity<List<JobApplicationDTO>> getApplicationsForOpening(@PathVariable Long openingId) {
        return ResponseEntity.ok(applicationService.getApplicationsForOpening(openingId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<JobApplicationDTO>> getApplicationsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(applicationService.getApplicationsByStudent(studentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationDTO> getApplicationById(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
    }

    /**
     * Placement officers update applicant status (SHORTLISTED, SELECTED, REJECTED, etc.)
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        String feedback = body.get("feedback");
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
        }
        try {
            applicationService.updateApplicationStatus(id, status, feedback);
            return ResponseEntity.ok(applicationService.getApplicationById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
