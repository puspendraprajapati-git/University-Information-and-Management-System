package com.university.placement.controller;

import com.university.placement.dto.StudentEligibilityDTO;
import com.university.placement.dto.StudentPlacementProfileDTO;
import com.university.placement.entity.StudentSkill;
import com.university.placement.service.StudentPlacementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/placement/student", "/api/placement/student"})
@RequiredArgsConstructor
public class StudentPlacementController {

    private final StudentPlacementService studentPlacementService;

    @GetMapping("/{studentId}/profile")
    public ResponseEntity<StudentPlacementProfileDTO> getStudentProfile(@PathVariable Long studentId) {
        return ResponseEntity.ok(studentPlacementService.getStudentPlacementProfile(studentId));
    }

    @GetMapping("/{studentId}/academic")
    public ResponseEntity<StudentEligibilityDTO> getStudentAcademic(@PathVariable Long studentId) {
        return ResponseEntity.ok(studentPlacementService.getStudentAcademicInfo(studentId));
    }

    @GetMapping("/{studentId}/skills")
    public ResponseEntity<List<StudentSkill>> getStudentSkills(@PathVariable Long studentId) {
        return ResponseEntity.ok(studentPlacementService.getStudentSkills(studentId));
    }

    @PostMapping("/{studentId}/skills")
    public ResponseEntity<StudentSkill> addStudentSkill(
            @PathVariable Long studentId,
            @RequestBody StudentSkill skill) {
        return ResponseEntity.status(201).body(studentPlacementService.addStudentSkill(studentId, skill));
    }

    @DeleteMapping("/skills/{skillId}")
    public ResponseEntity<Void> deleteStudentSkill(@PathVariable Long skillId) {
        studentPlacementService.deleteStudentSkill(skillId);
        return ResponseEntity.noContent().build();
    }
}
