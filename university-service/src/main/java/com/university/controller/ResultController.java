package com.university.controller;

import io.swagger.v3.oas.annotations.Operation;
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

    // dependency - constructor based D.I
    private final ResultService resultService;

    /*
     * URI - /api/results
     * Method - POST
     * I/P - result req dto (Faculty uploads marks)
     * Success resp - api resp + SC 201
     * Error resp - SC 400
     */
    @PostMapping
    @Operation(description = "Upload result")
    public ResponseEntity<?> uploadResult(@Valid @RequestBody ResultReqDTO dto) {
        System.out.println("in upload result " + dto);
        return new ResponseEntity<>(resultService.uploadResult(dto), HttpStatus.CREATED);
    }

    /*
     * URI - /api/results/{id}
     * Method - PUT
     * I/P - id : path var, result req dto
     * Success resp - SC 200 + result resp dto
     * Error resp - SC 404
     */
    @PutMapping("/{id}")
    @Operation(description = "Update result")
    public ResponseEntity<?> updateResult(@PathVariable Long id, @Valid @RequestBody ResultReqDTO dto) {
        System.out.println("in update result " + id);
        return ResponseEntity.ok(resultService.updateResult(id, dto));
    }

    /*
     * URI - /api/results/{id}
     * Method - GET
     * I/P - id : path var
     * Success resp - SC 200 , + result resp dto
     * Error resp - SC 404
     */
    @GetMapping("/{id}")
    @Operation(description = "Get result by id")
    public ResponseEntity<?> getResultById(@PathVariable Long id) {
        System.out.println("in get result " + id);
        return ResponseEntity.ok(resultService.getResultById(id));
    }

    /*
     * URI - /api/results
     * Method - GET
     * resp - SC 200 + List<dto>
     */
    @GetMapping
    @Operation(description = "Get all results")
    public ResponseEntity<?> getAllResults() {
        System.out.println("in get all results");
        return ResponseEntity.ok(resultService.getAllResults());
    }

    /*
     * URI - /api/results/student/{studentId}
     * Method - GET
     * I/P - studentId : path var (Student views all their results)
     * Success resp - SC 200 , + List<dto>
     */
    @GetMapping("/student/{studentId}")
    @Operation(description = "Get results by student")
    public ResponseEntity<?> getResultsByStudent(@PathVariable Long studentId) {
        System.out.println("in get results by student " + studentId);
        return ResponseEntity.ok(resultService.getResultsByStudent(studentId));
    }

    /*
     * URI - /api/results/student/{studentId}/semester/{semesterId}
     * Method - GET
     * I/P - studentId : path var, semesterId : path var (Student views semester result with GPA)
     * Success resp - SC 200 , + semester result dto
     */
    @GetMapping("/student/{studentId}/semester/{semesterId}")
    @Operation(description = "Get semester result")
    public ResponseEntity<?> getSemesterResult(
            @PathVariable Long studentId, @PathVariable Long semesterId) {
        System.out.println("in get semester result for student " + studentId + " semester " + semesterId);
        return ResponseEntity.ok(resultService.getSemesterResult(studentId, semesterId));
    }

    /*
     * URI - /api/results/{id}
     * Method - DELETE
     * I/P - id : path var
     * Success resp - SC 200
     * Error resp - SC 404
     */
    @DeleteMapping("/{id}")
    @Operation(description = "Delete result")
    public ResponseEntity<?> deleteResult(@PathVariable Long id) {
        System.out.println("in delete result " + id);
        resultService.deleteResult(id);
        return ResponseEntity.ok("Result deleted successfully");
    }
}