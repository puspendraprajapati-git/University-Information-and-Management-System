package com.university.exam.service;

import com.university.exam.dto.ExamDTO;
import com.university.exam.dto.ExamScheduleReqDTO;
import com.university.exam.dto.StudentHallTicketDTO;
import com.university.exam.entity.*;
import com.university.exam.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamRoomRepository roomRepository;
    private final ExamScheduleRepository scheduleRepository;
    private final StudentExamRegistrationRepository registrationRepository;
    private final JdbcTemplate jdbcTemplate;

    public List<ExamDTO> getAllExams(Long semesterId) {
        List<Exam> exams = (semesterId != null) 
                ? examRepository.findBySemesterId(semesterId)
                : examRepository.findAll();

        List<ExamDTO> dtos = new ArrayList<>();
        for (Exam exam : exams) {
            dtos.add(mapToExamDTO(exam));
        }
        return dtos;
    }

    public ExamDTO getExamById(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found with ID: " + examId));
        return mapToExamDTO(exam);
    }

    public Exam createExam(Exam exam) {
        return examRepository.save(exam);
    }

    /**
     * Prevents overlapping exam schedules for the same room.
     */
    @Transactional
    public ExamSchedule scheduleExam(ExamScheduleReqDTO dto) {
        Exam exam = examRepository.findById(dto.getExamId())
                .orElseThrow(() -> new RuntimeException("Exam not found: " + dto.getExamId()));

        ExamRoom room = roomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new RuntimeException("Exam room not found: " + dto.getRoomId()));

        if (dto.getEndTime().isBefore(dto.getStartTime()) || dto.getEndTime().equals(dto.getStartTime())) {
            throw new IllegalArgumentException("End time must be strictly after start time");
        }

        // Room Overlap Check
        long clashes = scheduleRepository.countOverlappingExamRoomSchedules(
                dto.getRoomId(),
                exam.getExamDate(),
                dto.getStartTime(),
                dto.getEndTime(),
                null
        );

        if (clashes > 0) {
            throw new IllegalStateException("Room Conflict: Room '" + room.getRoomName() + "' in " + room.getBuilding() 
                    + " is already booked for another examination on " + exam.getExamDate() 
                    + " during " + dto.getStartTime() + " - " + dto.getEndTime());
        }

        // If an existing schedule exists for this exam, update or replace
        List<ExamSchedule> existing = scheduleRepository.findByExamId(dto.getExamId());
        ExamSchedule schedule;
        if (!existing.isEmpty()) {
            schedule = existing.get(0);
            schedule.setRoomId(dto.getRoomId());
            schedule.setStartTime(dto.getStartTime());
            schedule.setEndTime(dto.getEndTime());
        } else {
            schedule = ExamSchedule.builder()
                    .examId(dto.getExamId())
                    .roomId(dto.getRoomId())
                    .startTime(dto.getStartTime())
                    .endTime(dto.getEndTime())
                    .build();
        }

        return scheduleRepository.save(schedule);
    }

    /**
     * Enrolls students into the exam and assigns seat numbers.
     */
    @Transactional
    public StudentExamRegistration registerStudentForExam(Long examId, Long studentId) {
        Optional<StudentExamRegistration> existing = registrationRepository.findByExamIdAndStudentId(examId, studentId);
        if (existing.isPresent()) {
            return existing.get();
        }

        long count = registrationRepository.countByExamId(examId);
        String seatNumber = "SEAT-" + ((char) ('A' + (count / 30))) + String.format("%02d", (count % 30) + 1);

        StudentExamRegistration reg = StudentExamRegistration.builder()
                .examId(examId)
                .studentId(studentId)
                .seatNumber(seatNumber)
                .status("ELIGIBLE")
                .build();

        return registrationRepository.save(reg);
    }

    /**
     * Personalized Hall Ticket for Student
     * Combines exam schedule, room, seating, and connects to existing 'results' record if published.
     */
    public List<StudentHallTicketDTO> getStudentHallTicket(Long studentId) {
        List<StudentExamRegistration> regs = registrationRepository.findByStudentId(studentId);
        List<StudentHallTicketDTO> tickets = new ArrayList<>();

        for (StudentExamRegistration reg : regs) {
            Optional<Exam> examOpt = examRepository.findById(reg.getExamId());
            if (examOpt.isEmpty()) continue;
            Exam exam = examOpt.get();

            // Fetch subject metadata
            String subjectName = "Subject " + exam.getSubjectId();
            String subjectCode = "SUB" + exam.getSubjectId();
            try {
                Map<String, Object> subMap = jdbcTemplate.queryForMap(
                        "SELECT subject_name, subject_code FROM subjects WHERE id = ?", exam.getSubjectId());
                subjectName = (String) subMap.get("subject_name");
                subjectCode = (String) subMap.get("subject_code");
            } catch (Exception ignored) {}

            // Fetch schedule & room
            String roomName = "Unassigned";
            String building = "";
            LocalTime startTime = null;
            LocalTime endTime = null;

            List<ExamSchedule> schedules = scheduleRepository.findByExamId(exam.getExamId());
            if (!schedules.isEmpty()) {
                ExamSchedule sch = schedules.get(0);
                startTime = sch.getStartTime();
                endTime = sch.getEndTime();
                Optional<ExamRoom> roomOpt = roomRepository.findById(sch.getRoomId());
                if (roomOpt.isPresent()) {
                    roomName = roomOpt.get().getRoomName();
                    building = roomOpt.get().getBuilding();
                }
            }

            // Check if result is already recorded in RESULTS table
            Double marksObtained = null;
            String grade = null;
            boolean isResultPublished = false;

            try {
                List<Map<String, Object>> resultRows = jdbcTemplate.queryForList(
                        "SELECT total_marks, grade FROM results WHERE student_id = ? AND subject_id = ? AND semester_id = ?",
                        studentId, exam.getSubjectId(), exam.getSemesterId());
                if (!resultRows.isEmpty()) {
                    Object tm = resultRows.get(0).get("total_marks");
                    if (tm instanceof Number n) {
                        marksObtained = n.doubleValue();
                    }
                    grade = (String) resultRows.get(0).get("grade");
                    isResultPublished = true;
                }
            } catch (Exception ignored) {}

            tickets.add(StudentHallTicketDTO.builder()
                    .registrationId(reg.getRegistrationId())
                    .examId(exam.getExamId())
                    .subjectName(subjectName)
                    .subjectCode(subjectCode)
                    .examType(exam.getExamType())
                    .examDate(exam.getExamDate())
                    .durationMinutes(exam.getDurationMinutes())
                    .totalMarks(exam.getTotalMarks())
                    .roomName(roomName)
                    .building(building)
                    .seatNumber(reg.getSeatNumber())
                    .startTime(startTime)
                    .endTime(endTime)
                    .registrationStatus(reg.getStatus())
                    .marksObtained(marksObtained)
                    .grade(grade)
                    .isResultPublished(isResultPublished)
                    .build());
        }

        tickets.sort(Comparator.comparing(StudentHallTicketDTO::getExamDate, Comparator.nullsLast(Comparator.naturalOrder())));
        return tickets;
    }

    private ExamDTO mapToExamDTO(Exam exam) {
        String subjectName = "Subject " + exam.getSubjectId();
        String subjectCode = "SUB" + exam.getSubjectId();
        try {
            Map<String, Object> subMap = jdbcTemplate.queryForMap(
                    "SELECT subject_name, subject_code FROM subjects WHERE id = ?", exam.getSubjectId());
            subjectName = (String) subMap.get("subject_name");
            subjectCode = (String) subMap.get("subject_code");
        } catch (Exception ignored) {}

        String semesterName = "Semester " + exam.getSemesterId();
        try {
            Map<String, Object> semMap = jdbcTemplate.queryForMap(
                    "SELECT semester_name FROM semesters WHERE id = ?", exam.getSemesterId());
            semesterName = (String) semMap.get("semester_name");
        } catch (Exception ignored) {}

        ExamDTO dto = ExamDTO.builder()
                .examId(exam.getExamId())
                .subjectId(exam.getSubjectId())
                .subjectName(subjectName)
                .subjectCode(subjectCode)
                .semesterId(exam.getSemesterId())
                .semesterName(semesterName)
                .examType(exam.getExamType())
                .examDate(exam.getExamDate())
                .durationMinutes(exam.getDurationMinutes())
                .totalMarks(exam.getTotalMarks())
                .build();

        List<ExamSchedule> schedules = scheduleRepository.findByExamId(exam.getExamId());
        if (!schedules.isEmpty()) {
            ExamSchedule sch = schedules.get(0);
            dto.setScheduleId(sch.getScheduleId());
            dto.setRoomId(sch.getRoomId());
            dto.setStartTime(sch.getStartTime());
            dto.setEndTime(sch.getEndTime());
            roomRepository.findById(sch.getRoomId()).ifPresent(r -> {
                dto.setRoomName(r.getRoomName());
                dto.setBuilding(r.getBuilding());
            });
        }

        return dto;
    }
}
