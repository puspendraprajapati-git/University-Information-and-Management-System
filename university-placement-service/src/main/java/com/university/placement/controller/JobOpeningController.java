package com.university.placement.controller;

import com.university.placement.dto.JobOpeningDTO;
import com.university.placement.dto.JobOpeningReqDTO;
import com.university.placement.dto.StudentEligibilityDTO;
import com.university.placement.entity.JobOpening;
import com.university.placement.service.JobOpeningService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/placement/jobs", "/api/placement/jobs"})
@RequiredArgsConstructor
public class JobOpeningController {

    private final JobOpeningService jobOpeningService;

    @GetMapping
    public ResponseEntity<List<JobOpeningDTO>> getAllOpenings(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly,
            @RequestParam(required = false) Long studentId) {
        if (activeOnly) {
            return ResponseEntity.ok(jobOpeningService.getActiveOpenings(studentId));
        }
        return ResponseEntity.ok(jobOpeningService.getAllOpenings(studentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobOpeningDTO> getOpeningById(
            @PathVariable Long id,
            @RequestParam(required = false) Long studentId) {
        return ResponseEntity.ok(jobOpeningService.getOpeningById(id, studentId));
    }

    @PostMapping
    public ResponseEntity<JobOpening> createOpening(@Valid @RequestBody JobOpeningReqDTO dto) {
        return ResponseEntity.status(201).body(jobOpeningService.createOpening(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobOpening> updateOpening(@PathVariable Long id, @RequestBody JobOpeningReqDTO dto) {
        return ResponseEntity.ok(jobOpeningService.updateOpening(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOpening(@PathVariable Long id) {
        jobOpeningService.deleteOpening(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Placement officers can view students meeting academic criteria for this job
     */
    @GetMapping("/{id}/eligible-students")
    public ResponseEntity<List<StudentEligibilityDTO>> getEligibleStudents(@PathVariable Long id) {
        return ResponseEntity.ok(jobOpeningService.getEligibleStudentsForJob(id));
    }
}
