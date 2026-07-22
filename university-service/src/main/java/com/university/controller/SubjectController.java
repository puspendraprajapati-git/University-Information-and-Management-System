package com.university.controller;

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

    private final SubjectService subjectService;

    @PostMapping
    public ResponseEntity<SubjectRespDTO> createSubject(@Valid @RequestBody SubjectReqDTO dto) {
        return new ResponseEntity<>(subjectService.createSubject(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubjectRespDTO> getSubjectById(@PathVariable Long id) {
        return ResponseEntity.ok(subjectService.getSubjectById(id));
    }

    @GetMapping
    public ResponseEntity<List<SubjectRespDTO>> getAllSubjects() {
        return ResponseEntity.ok(subjectService.getAllSubjects());
    }

    @GetMapping("/semester/{semesterId}")
    public ResponseEntity<List<SubjectRespDTO>> getSubjectsBySemester(@PathVariable Long semesterId) {
        return ResponseEntity.ok(subjectService.getSubjectsBySemester(semesterId));
    }

    @GetMapping("/department/{deptId}")
    public ResponseEntity<List<SubjectRespDTO>> getSubjectsByDepartment(@PathVariable Long deptId) {
        return ResponseEntity.ok(subjectService.getSubjectsByDepartment(deptId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubjectRespDTO> updateSubject(@PathVariable Long id, @Valid @RequestBody SubjectReqDTO dto) {
        return ResponseEntity.ok(subjectService.updateSubject(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSubject(@PathVariable Long id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.ok("Subject deleted successfully");
    }
}