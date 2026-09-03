package com.university.controller;

import io.swagger.v3.oas.annotations.Operation;
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

    // dependency - constructor based D.I
    private final AttendanceService attendanceService;

    /*
     * URI - /api/attendance
     * Method - POST
     * I/P - attendance req dto (Faculty marks attendance)
     * Success resp - api resp + SC 201
     * Error resp - SC 400
     */
    @PostMapping
    @Operation(description = "Mark attendance")
    public ResponseEntity<?> markAttendance(@Valid @RequestBody AttendanceReqDTO dto) {
        System.out.println("in mark attendance " + dto);
        return new ResponseEntity<>(attendanceService.markAttendance(dto), HttpStatus.CREATED);
    }

    /*
     * URI - /api/attendance/{id}
     * Method - PUT
     * I/P - id : path var, attendance req dto (Faculty updates attendance)
     * Success resp - SC 200 + attendance resp dto
     * Error resp - SC 404
     */
    @PutMapping("/{id}")
    @Operation(description = "Update attendance")
    public ResponseEntity<?> updateAttendance(@PathVariable Long id, @Valid @RequestBody AttendanceReqDTO dto) {
        System.out.println("in update attendance " + id);
        return ResponseEntity.ok(attendanceService.updateAttendance(id, dto));
    }

    /*
     * URI - /api/attendance/{id}
     * Method - GET
     * I/P - id : path var
     * Success resp - SC 200 , + attendance resp dto
     * Error resp - SC 404
     */
    @GetMapping("/{id}")
    @Operation(description = "Get attendance by id")
    public ResponseEntity<?> getAttendanceById(@PathVariable Long id) {
        System.out.println("in get attendance " + id);
        return ResponseEntity.ok(attendanceService.getAttendanceById(id));
    }

    /*
     * URI - /api/attendance
     * Method - GET
     * resp - SC 200 + List<dto>
     */
    @GetMapping
    @Operation(description = "Get all attendance")
    public ResponseEntity<?> getAllAttendance() {
        System.out.println("in get all attendance");
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }

    /*
     * URI - /api/attendance/student/{studentId}
     * Method - GET
     * I/P - studentId : path var (Student views their own attendance)
     * Success resp - SC 200 , + List<dto>
     */
    @GetMapping("/student/{studentId}")
    @Operation(description = "Get attendance by student")
    public ResponseEntity<?> getAttendanceByStudent(@PathVariable Long studentId) {
        System.out.println("in get attendance by student " + studentId);
        return ResponseEntity.ok(attendanceService.getAttendanceByStudent(studentId));
    }

    /*
     * URI - /api/attendance/subject/{subjectId}
     * Method - GET
     * I/P - subjectId : path var (Faculty views attendance)
     * Success resp - SC 200 , + List<dto>
     */
    @GetMapping("/subject/{subjectId}")
    @Operation(description = "Get attendance by subject")
    public ResponseEntity<?> getAttendanceBySubject(@PathVariable Long subjectId) {
        System.out.println("in get attendance by subject " + subjectId);
        return ResponseEntity.ok(attendanceService.getAttendanceBySubject(subjectId));
    }

    /*
     * URI - /api/attendance/subject/{subjectId}/semester/{semesterId}
     * Method - GET
     */
    @GetMapping("/subject/{subjectId}/semester/{semesterId}")
    @Operation(description = "Get attendance by subject and semester")
    public ResponseEntity<?> getAttendanceBySubjectAndSemester(@PathVariable Long subjectId, @PathVariable Long semesterId) {
        System.out.println("in get attendance by subject " + subjectId + " and semester " + semesterId);
        return ResponseEntity.ok(attendanceService.getAttendanceBySubjectAndSemester(subjectId, semesterId));
    }

    /*
     * URI - /api/attendance/{id}
     * Method - DELETE
     * I/P - id : path var
     * Success resp - SC 200
     * Error resp - SC 404
     */
    @DeleteMapping("/{id}")
    @Operation(description = "Delete attendance")
    public ResponseEntity<?> deleteAttendance(@PathVariable Long id) {
        System.out.println("in delete attendance " + id);
        attendanceService.deleteAttendance(id);
        return ResponseEntity.ok("Attendance record deleted successfully");
    }
}
