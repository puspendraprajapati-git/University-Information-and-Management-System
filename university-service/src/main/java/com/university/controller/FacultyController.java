package com.university.controller;

import io.swagger.v3.oas.annotations.Operation;
import com.university.dto.FacultyReqDTO;
import com.university.dto.FacultyRespDTO;
import com.university.service.FacultyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faculty")
@RequiredArgsConstructor
public class FacultyController {

    // dependency - constructor based D.I
    private final FacultyService facultyService;

    /*
     * URI - /api/faculty
     * Method - POST
     * I/P - faculty req dto
     * Success resp - api resp + SC 201
     * Error resp - SC 400
     */
    @PostMapping
    @Operation(description = "Create faculty")
    public ResponseEntity<?> createFaculty(@Valid @RequestBody FacultyReqDTO dto) {
        System.out.println("in create faculty " + dto);
        return new ResponseEntity<>(facultyService.createFaculty(dto), HttpStatus.CREATED);
    }

    /*
     * URI - /api/faculty/{id}
     * Method - GET
     * I/P - id : path var
     * Success resp - SC 200 , + faculty resp dto
     * Error resp - SC 404
     */
    @GetMapping("/{id}")
    @Operation(description = "Get faculty by id")
    public ResponseEntity<?> getFacultyById(@PathVariable Long id) {
        System.out.println("in get faculty " + id);
        return ResponseEntity.ok(facultyService.getFacultyById(id));
    }

    /*
     * URI - /api/faculty
     * Method - GET
     * resp - SC 200 + List<dto>
     */
    @GetMapping
    @Operation(description = "Get all faculty")
    public ResponseEntity<?> getAllFaculty() {
        System.out.println("in get all faculty");
        return ResponseEntity.ok(facultyService.getAllFaculty());
    }

    /*
     * URI - /api/faculty/{id}
     * Method - PUT
     * I/P - id : path var, faculty req dto
     * Success resp - SC 200 + faculty resp dto
     * Error resp - SC 404
     */
    @PutMapping("/{id}")
    @Operation(description = "Update faculty")
    public ResponseEntity<?> updateFaculty(@PathVariable Long id, @Valid @RequestBody FacultyReqDTO dto) {
        System.out.println("in update faculty " + id);
        return ResponseEntity.ok(facultyService.updateFaculty(id, dto));
    }

    /*
     * URI - /api/faculty/{id}
     * Method - DELETE
     * I/P - id : path var
     * Success resp - SC 200
     * Error resp - SC 404
     */
    @DeleteMapping("/{id}")
    @Operation(description = "Delete faculty")
    public ResponseEntity<?> deleteFaculty(@PathVariable Long id) {
        System.out.println("in delete faculty " + id);
        facultyService.deleteFaculty(id);
        return ResponseEntity.ok("Faculty deleted successfully");
    }
}