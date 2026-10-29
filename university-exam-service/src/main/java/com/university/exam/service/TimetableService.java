package com.university.exam.service;

import com.university.exam.dto.TimetableSlotDTO;
import com.university.exam.dto.TimetableSlotReqDTO;
import com.university.exam.entity.ExamRoom;
import com.university.exam.entity.TimetableSlot;
import com.university.exam.repository.ExamRoomRepository;
import com.university.exam.repository.TimetableSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TimetableService {

    private final TimetableSlotRepository slotRepository;
    private final ExamRoomRepository roomRepository;
    private final JdbcTemplate jdbcTemplate;

    public List<TimetableSlotDTO> getTimetableBySemester(Long semesterId) {
        List<TimetableSlot> slots = slotRepository.findBySemesterId(semesterId);
        return mapToDTOs(slots);
    }

    public List<TimetableSlotDTO> getTimetableByFaculty(Long facultyId) {
        List<TimetableSlot> slots = slotRepository.findByFacultyId(facultyId);
        return mapToDTOs(slots);
    }

    public List<TimetableSlotDTO> getAllTimetableSlots() {
        return mapToDTOs(slotRepository.findAll());
    }

    /**
     * Prevents overlapping class schedules for the same room or same faculty member.
     */
    @Transactional
    public TimetableSlot createSlot(TimetableSlotReqDTO dto) {
        if (dto.getEndTime().isBefore(dto.getStartTime()) || dto.getEndTime().equals(dto.getStartTime())) {
            throw new IllegalArgumentException("Class end time must be strictly after start time");
        }

        ExamRoom room = roomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found: " + dto.getRoomId()));

        // 1. Room Overlap Check
        long roomClashes = slotRepository.countOverlappingRoomSlots(
                dto.getRoomId(),
                dto.getDayOfWeek().toUpperCase(),
                dto.getStartTime(),
                dto.getEndTime(),
                null
        );

        if (roomClashes > 0) {
            throw new IllegalStateException("Room Double-Booking: " + room.getRoomName() 
                    + " is already reserved on " + dto.getDayOfWeek() 
                    + " between " + dto.getStartTime() + " - " + dto.getEndTime());
        }

        // 2. Faculty Overlap Check
        long facultyClashes = slotRepository.countOverlappingFacultySlots(
                dto.getFacultyId(),
                dto.getDayOfWeek().toUpperCase(),
                dto.getStartTime(),
                dto.getEndTime(),
                null
        );

        if (facultyClashes > 0) {
            throw new IllegalStateException("Faculty Schedule Conflict: The assigned faculty member is already teaching another class on " 
                    + dto.getDayOfWeek() + " between " + dto.getStartTime() + " - " + dto.getEndTime());
        }

        TimetableSlot slot = TimetableSlot.builder()
                .subjectId(dto.getSubjectId())
                .facultyId(dto.getFacultyId())
                .semesterId(dto.getSemesterId())
                .roomId(dto.getRoomId())
                .dayOfWeek(dto.getDayOfWeek().toUpperCase())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .build();

        return slotRepository.save(slot);
    }

    public void deleteSlot(Long slotId) {
        slotRepository.deleteById(slotId);
    }

    private List<TimetableSlotDTO> mapToDTOs(List<TimetableSlot> slots) {
        List<TimetableSlotDTO> dtos = new ArrayList<>();
        for (TimetableSlot s : slots) {
            String subjectName = "Subject " + s.getSubjectId();
            String subjectCode = "SUB" + s.getSubjectId();
            try {
                Map<String, Object> sub = jdbcTemplate.queryForMap(
                        "SELECT subject_name, subject_code FROM subjects WHERE id = ?", s.getSubjectId());
                subjectName = (String) sub.get("subject_name");
                subjectCode = (String) sub.get("subject_code");
            } catch (Exception ignored) {}

            String facultyName = "Faculty " + s.getFacultyId();
            try {
                Map<String, Object> fac = jdbcTemplate.queryForMap(
                        "SELECT full_name FROM faculty WHERE id = ?", s.getFacultyId());
                facultyName = (String) fac.get("full_name");
            } catch (Exception ignored) {}

            String semesterName = "Semester " + s.getSemesterId();
            try {
                Map<String, Object> sem = jdbcTemplate.queryForMap(
                        "SELECT semester_name FROM semesters WHERE id = ?", s.getSemesterId());
                semesterName = (String) sem.get("semester_name");
            } catch (Exception ignored) {}

            String roomName = "Room " + s.getRoomId();
            String building = "";
            try {
                ExamRoom r = roomRepository.findById(s.getRoomId()).orElse(null);
                if (r != null) {
                    roomName = r.getRoomName();
                    building = r.getBuilding();
                }
            } catch (Exception ignored) {}

            dtos.add(TimetableSlotDTO.builder()
                    .slotId(s.getSlotId())
                    .subjectId(s.getSubjectId())
                    .subjectName(subjectName)
                    .subjectCode(subjectCode)
                    .facultyId(s.getFacultyId())
                    .facultyName(facultyName)
                    .semesterId(s.getSemesterId())
                    .semesterName(semesterName)
                    .roomId(s.getRoomId())
                    .roomName(roomName)
                    .building(building)
                    .dayOfWeek(s.getDayOfWeek())
                    .startTime(s.getStartTime())
                    .endTime(s.getEndTime())
                    .build());
        }
        return dtos;
    }
}
