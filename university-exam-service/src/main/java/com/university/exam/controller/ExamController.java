package com.university.exam.controller;

import com.university.exam.dto.ExamDTO;
import com.university.exam.dto.ExamScheduleReqDTO;
import com.university.exam.dto.StudentHallTicketDTO;
import com.university.exam.entity.Exam;
import com.university.exam.entity.ExamSchedule;
import com.university.exam.entity.StudentExamRegistration;
import com.university.exam.service.ExamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/exams", "/api/exams"})
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("service", "university-exam-service", "status", "UP"));
    }

    @GetMapping
    public ResponseEntity<List<ExamDTO>> getAllExams(@RequestParam(required = false) Long semesterId) {
        return ResponseEntity.ok(examService.getAllExams(semesterId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExamDTO> getExamById(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExamById(id));
    }

    @PostMapping
    public ResponseEntity<Exam> createExam(@RequestBody Exam exam) {
        return ResponseEntity.status(201).body(examService.createExam(exam));
    }

    /**
     * Prevents overlapping exam schedules for the same room.
     */
    @PostMapping("/schedule")
    public ResponseEntity<?> scheduleExam(@Valid @RequestBody ExamScheduleReqDTO dto) {
        try {
            ExamSchedule schedule = examService.scheduleExam(dto);
            return ResponseEntity.status(201).body(schedule);
        } catch (IllegalStateException e) {
            // Room conflict
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage(), "conflictType", "ROOM_OVERLAP"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Register student for exam
     */
    @PostMapping("/{examId}/register/{studentId}")
    public ResponseEntity<StudentExamRegistration> registerStudent(
            @PathVariable Long examId,
            @PathVariable Long studentId) {
        return ResponseEntity.status(201).body(examService.registerStudentForExam(examId, studentId));
    }

    /**
     * View student's personalized examination timetable and admit card
     */
    @GetMapping("/hall-ticket/{studentId}")
    public ResponseEntity<List<StudentHallTicketDTO>> getStudentHallTicket(@PathVariable Long studentId) {
        return ResponseEntity.ok(examService.getStudentHallTicket(studentId));
    }
}
