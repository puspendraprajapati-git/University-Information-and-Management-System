package com.university.controller;

import io.swagger.v3.oas.annotations.Operation;
import com.university.dto.SemesterDTO;
import com.university.service.SemesterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/semesters")
@RequiredArgsConstructor
public class SemesterController {

    // dependency - constructor based D.I
    private final SemesterService semesterService;

    /*
     * URI - /api/semesters
     * Method - POST
     * I/P - semester dto
     * Success resp - api resp + SC 201
     * Error resp - SC 400
     */
    @PostMapping
    @Operation(description = "Create semester")
    public ResponseEntity<?> createSemester(@Valid @RequestBody SemesterDTO dto) {
        System.out.println("in create semester " + dto);
        return new ResponseEntity<>(semesterService.createSemester(dto), HttpStatus.CREATED);
    }

    /*
     * URI - /api/semesters/{id}
     * Method - GET
     * I/P - id : path var
     * Success resp - SC 200 , + semester dto
     * Error resp - SC 404
     */
    @GetMapping("/{id}")
    @Operation(description = "Get semester by id")
    public ResponseEntity<?> getSemesterById(@PathVariable Long id) {
        System.out.println("in get semester " + id);
        return ResponseEntity.ok(semesterService.getSemesterById(id));
    }

    /*
     * URI - /api/semesters
     * Method - GET
     * resp - SC 200 + List<dto>
     */
    @GetMapping
    @Operation(description = "Get all semesters")
    public ResponseEntity<?> getAllSemesters() {
        System.out.println("in get all semesters");
        return ResponseEntity.ok(semesterService.getAllSemesters());
    }

    /*
     * URI - /api/semesters/{id}
     * Method - PUT
     * I/P - id : path var, semester dto
     * Success resp - SC 200 + semester dto
     * Error resp - SC 404
     */
    @PutMapping("/{id}")
    @Operation(description = "Update semester")
    public ResponseEntity<?> updateSemester(@PathVariable Long id, @Valid @RequestBody SemesterDTO dto) {
        System.out.println("in update semester " + id);
        return ResponseEntity.ok(semesterService.updateSemester(id, dto));
    }

    /*
     * URI - /api/semesters/{id}
     * Method - DELETE
     * I/P - id : path var
     * Success resp - SC 200
     * Error resp - SC 404
     */
    @DeleteMapping("/{id}")
    @Operation(description = "Delete semester")
    public ResponseEntity<?> deleteSemester(@PathVariable Long id) {
        System.out.println("in delete semester " + id);
        semesterService.deleteSemester(id);
        return ResponseEntity.ok("Semester deleted successfully");
    }
}