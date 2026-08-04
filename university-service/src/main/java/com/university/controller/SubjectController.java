package com.university.controller;

import io.swagger.v3.oas.annotations.Operation;
import com.university.dto.SubjectReqDTO;
import com.university.dto.SubjectRespDTO;
import com.university.service.SubjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class SubjectController {

    // dependency - constructor based D.I
    private final SubjectService subjectService;

    /*
     * URI - /api/subjects
     * Method - POST
     * I/P - subject req dto
     * Success resp - api resp + SC 201
     * Error resp - SC 400
     */
    @PostMapping
    @Operation(description = "Create subject")
    public ResponseEntity<?> createSubject(@Valid @RequestBody SubjectReqDTO dto) {
        System.out.println("in create subject " + dto);
        return new ResponseEntity<>(subjectService.createSubject(dto), HttpStatus.CREATED);
    }

    /*
     * URI - /api/subjects/{id}
     * Method - GET
     * I/P - id : path var
     * Success resp - SC 200 , + subject resp dto
     * Error resp - SC 404
     */
    @GetMapping("/{id}")
    @Operation(description = "Get subject by id")
    public ResponseEntity<?> getSubjectById(@PathVariable Long id) {
        System.out.println("in get subject " + id);
        return ResponseEntity.ok(subjectService.getSubjectById(id));
    }

    /*
     * URI - /api/subjects
     * Method - GET
     * resp - SC 200 + List<dto>
     */
    @GetMapping
    @Operation(description = "Get all subjects")
    public ResponseEntity<?> getAllSubjects() {
        System.out.println("in get all subjects");
        return ResponseEntity.ok(subjectService.getAllSubjects());
    }

    /*
     * URI - /api/subjects/semester/{semesterId}
     * Method - GET
     * I/P - semesterId : path var
     * Success resp - SC 200 , + List<dto>
     */
    @GetMapping("/semester/{semesterId}")
    @Operation(description = "Get subjects by semester")
    public ResponseEntity<?> getSubjectsBySemester(@PathVariable Long semesterId) {
        System.out.println("in get subjects by semester " + semesterId);
        return ResponseEntity.ok(subjectService.getSubjectsBySemester(semesterId));
    }

    /*
     * URI - /api/subjects/department/{deptId}
     * Method - GET
     * I/P - deptId : path var
     * Success resp - SC 200 , + List<dto>
     */
    @GetMapping("/department/{deptId}")
    @Operation(description = "Get subjects by department")
    public ResponseEntity<?> getSubjectsByDepartment(@PathVariable Long deptId) {
        System.out.println("in get subjects by department " + deptId);
        return ResponseEntity.ok(subjectService.getSubjectsByDepartment(deptId));
    }

    /*
     * URI - /api/subjects/{id}
     * Method - PUT
     * I/P - id : path var, subject req dto
     * Success resp - SC 200 + subject resp dto
     * Error resp - SC 404
     */
    @PutMapping("/{id}")
    @Operation(description = "Update subject")
    public ResponseEntity<?> updateSubject(@PathVariable Long id, @Valid @RequestBody SubjectReqDTO dto) {
        System.out.println("in update subject " + id);
        return ResponseEntity.ok(subjectService.updateSubject(id, dto));
    }

    /*
     * URI - /api/subjects/{id}
     * Method - DELETE
     * I/P - id : path var
     * Success resp - SC 200
     * Error resp - SC 404
     */
    @DeleteMapping("/{id}")
    @Operation(description = "Delete subject")
    public ResponseEntity<?> deleteSubject(@PathVariable Long id) {
        System.out.println("in delete subject " + id);
        subjectService.deleteSubject(id);
        return ResponseEntity.ok("Subject deleted successfully");
    }
}