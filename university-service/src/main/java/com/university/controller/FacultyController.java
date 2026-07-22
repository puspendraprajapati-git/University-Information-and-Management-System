package com.university.controller;

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

    private final FacultyService facultyService;

    @PostMapping
    public ResponseEntity<FacultyRespDTO> createFaculty(@Valid @RequestBody FacultyReqDTO dto) {
        return new ResponseEntity<>(facultyService.createFaculty(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FacultyRespDTO> getFacultyById(@PathVariable Long id) {
        return ResponseEntity.ok(facultyService.getFacultyById(id));
    }

    @GetMapping
    public ResponseEntity<List<FacultyRespDTO>> getAllFaculty() {
        return ResponseEntity.ok(facultyService.getAllFaculty());
    }

    @PutMapping("/{id}")
    public ResponseEntity<FacultyRespDTO> updateFaculty(@PathVariable Long id, @Valid @RequestBody FacultyReqDTO dto) {
        return ResponseEntity.ok(facultyService.updateFaculty(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFaculty(@PathVariable Long id) {
        facultyService.deleteFaculty(id);
        return ResponseEntity.ok("Faculty deleted successfully");
    }
}