package com.university.controller;

import com.university.dto.AttendanceReqDTO;
import com.university.dto.AttendanceRespDTO;
import com.university.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    // Faculty marks attendance
    @PostMapping
    public ResponseEntity<AttendanceRespDTO> markAttendance(@Valid @RequestBody AttendanceReqDTO dto) {
        return new ResponseEntity<>(attendanceService.markAttendance(dto), HttpStatus.CREATED);
    }

    // Faculty updates attendance
    @PutMapping("/{id}")
    public ResponseEntity<AttendanceRespDTO> updateAttendance(@PathVariable Long id, @Valid @RequestBody AttendanceReqDTO dto) {
        return ResponseEntity.ok(attendanceService.updateAttendance(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttendanceRespDTO> getAttendanceById(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceService.getAttendanceById(id));
    }

    @GetMapping
    public ResponseEntity<List<AttendanceRespDTO>> getAllAttendance() {
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }

    // Student views their own attendance
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceRespDTO>> getAttendanceByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByStudent(studentId));
    }

    // Faculty views attendance for a subject in a semester
    @GetMapping("/subject/{subjectId}/semester/{semesterId}")
    public ResponseEntity<List<AttendanceRespDTO>> getAttendanceBySubjectAndSemester(
            @PathVariable Long subjectId, @PathVariable Long semesterId) {
        return ResponseEntity.ok(attendanceService.getAttendanceBySubjectAndSemester(subjectId, semesterId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAttendance(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
        return ResponseEntity.ok("Attendance record deleted successfully");
    }
}