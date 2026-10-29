package com.university.lms.controller;

import com.university.lms.dto.AssignmentReqDTO;
import com.university.lms.dto.AssignmentRespDTO;
import com.university.lms.service.AssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/lms/assignments", "/assignments"})
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    /*
     * URI - /lms/assignments
     * Method - POST
     * I/P - AssignmentReqDTO
     * Success resp - SC 201 + AssignmentRespDTO
     */
    @PostMapping
    public ResponseEntity<AssignmentRespDTO> createAssignment(@Valid @RequestBody AssignmentReqDTO dto) {
        System.out.println("in create assignment: " + dto);
        return new ResponseEntity<>(assignmentService.createAssignment(dto), HttpStatus.CREATED);
    }

    /*
     * URI - /lms/assignments/{id}
     * Method - GET
     * Success resp - SC 200 + AssignmentRespDTO
     */
    @GetMapping("/{id}")
    public ResponseEntity<AssignmentRespDTO> getAssignmentById(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getAssignmentById(id));
    }

    /*
     * URI - /lms/assignments
     * Method - GET
     * Success resp - SC 200 + List<AssignmentRespDTO>
     */
    @GetMapping
    public ResponseEntity<List<AssignmentRespDTO>> getAllAssignments() {
        return ResponseEntity.ok(assignmentService.getAllAssignments());
    }

    /*
     * URI - /lms/assignments/subject/{subjectId}
     * Method - GET
     * Success resp - SC 200 + List<AssignmentRespDTO>
     */
    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<AssignmentRespDTO>> getAssignmentsBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsBySubject(subjectId));
    }

    /*
     * URI - /lms/assignments/faculty/{facultyId}
     * Method - GET
     * Success resp - SC 200 + List<AssignmentRespDTO>
     */
    @GetMapping("/faculty/{facultyId}")
    public ResponseEntity<List<AssignmentRespDTO>> getAssignmentsByFaculty(@PathVariable Long facultyId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByFaculty(facultyId));
    }

    /*
     * URI - /lms/assignments/{id}
     * Method - DELETE
     * Success resp - SC 200
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.ok().build();
    }
}
