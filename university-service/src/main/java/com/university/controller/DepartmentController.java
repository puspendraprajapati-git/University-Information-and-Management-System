package com.university.controller;

import com.university.dto.DepartmentDTO;
import com.university.service.DepartmentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
@Tag(name = "Department Management", description = "CRUD operations for university departments")
public class DepartmentController {

    // dependency - constructor based D.I
    private final DepartmentService departmentService;

    /*
     * URI - /api/departments
     * Method - POST
     * I/P - department dto
     * Success resp - api resp + SC 201
     * Error resp - SC 400
     */
    @PostMapping
    @Operation(description = "Create a new department")
    public ResponseEntity<?> createDepartment(@Valid @RequestBody DepartmentDTO dto) {
        System.out.println("in create department " + dto);
        return new ResponseEntity<>(departmentService.createDepartment(dto), HttpStatus.CREATED);
    }

    /*
     * URI - /api/departments/{id}
     * Method - GET
     * I/P - id : path var
     * Success resp - SC 200 , + department dto
     * Error resp - SC 404
     */
    @GetMapping("/{id}")
    @Operation(description = "Get department details by ID")
    public ResponseEntity<?> getDepartmentById(@PathVariable Long id) {
        System.out.println("in get department " + id);
        return ResponseEntity.ok(departmentService.getDepartmentById(id));
    }

    /*
     * URI - /api/departments
     * Method - GET
     * resp - SC 200 + List<dto>
     */
    @GetMapping
    @Operation(description = "Get all departments")
    public ResponseEntity<?> getAllDepartments() {
        System.out.println("in get all departments");
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    /*
     * URI - /api/departments/{id}
     * Method - PUT
     * I/P - id : path var, department dto
     * Success resp - SC 200 + department dto
     * Error resp - SC 404
     */
    @PutMapping("/{id}")
    @Operation(description = "Update an existing department")
    public ResponseEntity<?> updateDepartment(@PathVariable Long id, @Valid @RequestBody DepartmentDTO dto) {
        System.out.println("in update department " + id);
        return ResponseEntity.ok(departmentService.updateDepartment(id, dto));
    }

    /*
     * URI - /api/departments/{id}
     * Method - DELETE
     * I/P - id : path var
     * Success resp - SC 200
     * Error resp - SC 404
     */
    @DeleteMapping("/{id}")
    @Operation(description = "Delete a department")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long id) {
        System.out.println("in delete department " + id);
        departmentService.deleteDepartment(id);
        return ResponseEntity.ok("Department deleted successfully");
    }
}