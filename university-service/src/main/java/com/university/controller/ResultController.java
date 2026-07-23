package com.university.controller;

import com.university.dto.ResultReqDTO;
import com.university.dto.ResultRespDTO;
import com.university.dto.SemesterResultRespDTO;
import com.university.service.ResultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
public class ResultController {

    private final ResultService resultService;

    // Faculty uploads marks
    @PostMapping
    public ResponseEntity<ResultRespDTO> uploadResult(@Valid @RequestBody ResultReqDTO dto) {
        return new ResponseEntity<>(resultService.uploadResult(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResultRespDTO> updateResult(@PathVariable Long id, @Valid @RequestBody ResultReqDTO dto) {
        return ResponseEntity.ok(resultService.updateResult(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResultRespDTO> getResultById(@PathVariable Long id) {
        return ResponseEntity.ok(resultService.getResultById(id));
    }

    @GetMapping
    public ResponseEntity<List<ResultRespDTO>> getAllResults() {
        return ResponseEntity.ok(resultService.getAllResults());
    }

    // Student views all their results
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ResultRespDTO>> getResultsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(resultService.getResultsByStudent(studentId));
    }

    // Student views semester result with GPA
    @GetMapping("/student/{studentId}/semester/{semesterId}")
    public ResponseEntity<SemesterResultRespDTO> getSemesterResult(
            @PathVariable Long studentId, @PathVariable Long semesterId) {
        return ResponseEntity.ok(resultService.getSemesterResult(studentId, semesterId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteResult(@PathVariable Long id) {
        resultService.deleteResult(id);
        return ResponseEntity.ok("Result deleted successfully");
    }
}