package com.university.service.impl;

import com.university.dto.AttendanceReqDTO;
import com.university.dto.AttendanceRespDTO;
import com.university.entity.*;
import com.university.exception.ResourceNotFoundException;
import com.university.repository.*;
import com.university.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final FacultyRepository facultyRepository;
    private final SemesterRepository semesterRepository;

    @Override
    @Transactional
    public AttendanceRespDTO markAttendance(AttendanceReqDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + dto.getStudentId()));

        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + dto.getSubjectId()));

        Faculty faculty = facultyRepository.findById(dto.getFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + dto.getFacultyId()));

        Semester semester = semesterRepository.findById(dto.getSemesterId())
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with id: " + dto.getSemesterId()));

        Attendance attendance = Attendance.builder()
                .student(student)
                .subject(subject)
                .faculty(faculty)
                .semester(semester)
                .attendanceDate(dto.getAttendanceDate())
                .status(dto.getStatus())
                .build();

        Attendance saved = attendanceRepository.save(attendance);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public AttendanceRespDTO updateAttendance(Long id, AttendanceReqDTO dto) {
        Attendance existing = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found with id: " + id));

        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + dto.getStudentId()));

        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + dto.getSubjectId()));

        Faculty faculty = facultyRepository.findById(dto.getFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + dto.getFacultyId()));

        Semester semester = semesterRepository.findById(dto.getSemesterId())
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with id: " + dto.getSemesterId()));

        existing.setStudent(student);
        existing.setSubject(subject);
        existing.setFaculty(faculty);
        existing.setSemester(semester);
        existing.setAttendanceDate(dto.getAttendanceDate());
        existing.setStatus(dto.getStatus());

        Attendance updated = attendanceRepository.save(existing);
        return mapToResponse(updated);
    }

    @Override
    public AttendanceRespDTO getAttendanceById(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found with id: " + id));
        return mapToResponse(attendance);
    }

    @Override
    public List<AttendanceRespDTO> getAllAttendance() {
        return attendanceRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceRespDTO> getAttendanceByStudent(Long studentId) {
        return attendanceRepository.findByStudent_StudentId(studentId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceRespDTO> getAttendanceBySubjectAndSemester(Long subjectId, Long semesterId) {
        return attendanceRepository.findBySubject_SubjectIdAndSemester_SemesterId(subjectId, semesterId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteAttendance(Long id) {
        if (!attendanceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Attendance not found with id: " + id);
        }
        attendanceRepository.deleteById(id);
    }

    private AttendanceRespDTO mapToResponse(Attendance attendance) {
        return new AttendanceRespDTO(
                attendance.getAttendanceId(),
                attendance.getStudent().getStudentId(),
                attendance.getStudent().getFullName(),
                attendance.getSubject().getSubjectId(),
                attendance.getSubject().getSubjectName(),
                attendance.getFaculty().getFacultyId(),
                attendance.getFaculty().getFullName(),
                attendance.getSemester().getSemesterId(),
                attendance.getSemester().getSemesterName(),
                attendance.getAttendanceDate(),
                attendance.getStatus()
        );
    }
}