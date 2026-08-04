package com.university.controller;

import io.swagger.v3.oas.annotations.Operation;
import com.university.dto.StudentReqDTO;
import com.university.dto.StudentRespDTO;
import com.university.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    // dependency - constructor based D.I
    private final StudentService studentService;

    /*
     * URI - /api/students
     * Method - POST
     * I/P - student req dto
     * Success resp - api resp + SC 201
     * Error resp - SC 400
     */
    @PostMapping
    @Operation(description = "Create student")
    public ResponseEntity<?> createStudent(@Valid @RequestBody StudentReqDTO dto) {
        System.out.println("in create student " + dto);
        return new ResponseEntity<>(studentService.createStudent(dto), HttpStatus.CREATED);
    }

    /*
     * URI - /api/students/{id}
     * Method - GET
     * I/P - id : path var
     * Success resp - SC 200 , + student resp dto
     * Error resp - SC 404
     */
    @GetMapping("/{id}")
    @Operation(description = "Get student by id")
    public ResponseEntity<?> getStudentById(@PathVariable Long id) {
        System.out.println("in get student " + id);
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    /*
     * URI - /api/students
     * Method - GET
     * resp - SC 200 + List<dto>
     */
    @GetMapping
    @Operation(description = "Get all students")
    public ResponseEntity<?> getAllStudents() {
        System.out.println("in get all students");
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    /*
     * URI - /api/students/{id}
     * Method - PUT
     * I/P - id : path var, student req dto
     * Success resp - SC 200 + student resp dto
     * Error resp - SC 404
     */
    @PutMapping("/{id}")
    @Operation(description = "Update student")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @Valid @RequestBody StudentReqDTO dto) {
        System.out.println("in update student " + id);
        return ResponseEntity.ok(studentService.updateStudent(id, dto));
    }

    /*
     * URI - /api/students/{id}
     * Method - DELETE
     * I/P - id : path var
     * Success resp - SC 200
     * Error resp - SC 404
     */
    @DeleteMapping("/{id}")
    @Operation(description = "Delete student")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        System.out.println("in delete student " + id);
        studentService.deleteStudent(id);
        return ResponseEntity.ok("Student deleted successfully");
    }

    /*
     * URI - /api/students/search
     * Method - GET
     * I/P - name : request param
     * Success resp - SC 200 + List<dto>
     */
    @GetMapping("/search")
    @Operation(description = "Search by name")
    public ResponseEntity<?> searchByName(@RequestParam String name) {
        System.out.println("in search student by name " + name);
        return ResponseEntity.ok(studentService.searchByName(name));
    }
}