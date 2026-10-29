package com.university.placement.controller;

import com.university.placement.dto.PlacementDriveDTO;
import com.university.placement.entity.PlacementDrive;
import com.university.placement.service.PlacementDriveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/placement/drives", "/api/placement/drives"})
@RequiredArgsConstructor
public class PlacementDriveController {

    private final PlacementDriveService driveService;

    @GetMapping
    public ResponseEntity<List<PlacementDriveDTO>> getAllDrives() {
        return ResponseEntity.ok(driveService.getAllDrives());
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<PlacementDriveDTO>> getUpcomingDrives() {
        return ResponseEntity.ok(driveService.getUpcomingDrives());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlacementDriveDTO> getDriveById(@PathVariable Long id) {
        return ResponseEntity.ok(driveService.getDriveById(id));
    }

    @PostMapping
    public ResponseEntity<PlacementDrive> scheduleDrive(@RequestBody PlacementDriveDTO dto) {
        return ResponseEntity.status(201).body(driveService.scheduleDrive(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlacementDrive> updateDrive(@PathVariable Long id, @RequestBody PlacementDriveDTO dto) {
        return ResponseEntity.ok(driveService.updateDrive(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDrive(@PathVariable Long id) {
        driveService.deleteDrive(id);
        return ResponseEntity.noContent().build();
    }
}
