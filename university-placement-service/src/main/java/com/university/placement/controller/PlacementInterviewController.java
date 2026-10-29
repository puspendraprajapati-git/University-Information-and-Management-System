package com.university.placement.controller;

import com.university.placement.dto.PlacementInterviewDTO;
import com.university.placement.dto.PlacementInterviewReqDTO;
import com.university.placement.entity.PlacementInterview;
import com.university.placement.service.PlacementInterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/placement/interviews", "/api/placement/interviews"})
@RequiredArgsConstructor
public class PlacementInterviewController {

    private final PlacementInterviewService interviewService;

    @PostMapping
    public ResponseEntity<PlacementInterview> scheduleInterview(@Valid @RequestBody PlacementInterviewReqDTO dto) {
        return ResponseEntity.status(201).body(interviewService.scheduleInterview(dto));
    }

    @PatchMapping("/{id}/result")
    public ResponseEntity<PlacementInterview> updateInterviewResult(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String result = body.get("result");
        String remarks = body.get("remarks");
        return ResponseEntity.ok(interviewService.updateInterviewResult(id, result, remarks));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<PlacementInterviewDTO>> getInterviewsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(interviewService.getInterviewsByStudent(studentId));
    }

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<List<PlacementInterviewDTO>> getInterviewsByApplication(@PathVariable Long applicationId) {
        return ResponseEntity.ok(interviewService.getInterviewsByApplication(applicationId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInterview(@PathVariable Long id) {
        interviewService.deleteInterview(id);
        return ResponseEntity.noContent().build();
    }
}
