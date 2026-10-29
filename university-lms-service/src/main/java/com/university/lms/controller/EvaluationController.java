package com.university.lms.controller;

import com.university.lms.dto.EvaluationReqDTO;
import com.university.lms.dto.EvaluationRespDTO;
import com.university.lms.service.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/lms/evaluations", "/evaluations"})
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    /*
     * URI - /lms/evaluations
     * Method - POST
     * I/P - EvaluationReqDTO
     * Success resp - SC 201 + EvaluationRespDTO
     */
    @PostMapping
    public ResponseEntity<EvaluationRespDTO> evaluateSubmission(@Valid @RequestBody EvaluationReqDTO dto) {
        System.out.println("in evaluate submission: " + dto);
        return new ResponseEntity<>(evaluationService.evaluateSubmission(dto), HttpStatus.CREATED);
    }

    /*
     * URI - /lms/evaluations/submission/{submissionId}
     * Method - GET
     * Success resp - SC 200 + EvaluationRespDTO
     */
    @GetMapping("/submission/{submissionId}")
    public ResponseEntity<EvaluationRespDTO> getEvaluationBySubmissionId(@PathVariable Long submissionId) {
        return ResponseEntity.ok(evaluationService.getEvaluationBySubmissionId(submissionId));
    }
}
