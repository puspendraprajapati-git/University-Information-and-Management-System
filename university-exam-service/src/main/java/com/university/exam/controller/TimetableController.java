package com.university.exam.controller;

import com.university.exam.dto.TimetableSlotDTO;
import com.university.exam.dto.TimetableSlotReqDTO;
import com.university.exam.entity.TimetableSlot;
import com.university.exam.service.TimetableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/timetable", "/api/timetable"})
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableService timetableService;

    @GetMapping
    public ResponseEntity<List<TimetableSlotDTO>> getAllSlots() {
        return ResponseEntity.ok(timetableService.getAllTimetableSlots());
    }

    @GetMapping("/semester/{semesterId}")
    public ResponseEntity<List<TimetableSlotDTO>> getTimetableBySemester(@PathVariable Long semesterId) {
        return ResponseEntity.ok(timetableService.getTimetableBySemester(semesterId));
    }

    @GetMapping("/faculty/{facultyId}")
    public ResponseEntity<List<TimetableSlotDTO>> getTimetableByFaculty(@PathVariable Long facultyId) {
        return ResponseEntity.ok(timetableService.getTimetableByFaculty(facultyId));
    }

    /**
     * Prevents overlapping class schedules for the same room or faculty.
     */
    @PostMapping({"", "/slot"})
    public ResponseEntity<?> createSlot(@Valid @RequestBody TimetableSlotReqDTO dto) {
        try {
            TimetableSlot slot = timetableService.createSlot(dto);
            return ResponseEntity.status(201).body(slot);
        } catch (IllegalStateException e) {
            // Room or faculty clash
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage(), "conflictType", "TIMETABLE_CLASH"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/slot/{id}")
    public ResponseEntity<Void> deleteSlot(@PathVariable Long id) {
        timetableService.deleteSlot(id);
        return ResponseEntity.noContent().build();
    }
}
