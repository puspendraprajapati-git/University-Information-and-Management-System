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

    /*
     * Method to mark attendance for a student
     */
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

    /*
     * Method to update an existing attendance record
     */
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

    /*
     * Method to get attendance record by ID
     */
    @Override
    @Transactional(readOnly = true)
    public AttendanceRespDTO getAttendanceById(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found with id: " + id));
        return mapToResponse(attendance);
    }

    /*
     * Method to get all attendance records
     */
    @Override
    @Transactional(readOnly = true)
    public List<AttendanceRespDTO> getAllAttendance() {
        return attendanceRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /*
     * Method to get attendance records by student ID
     */
    @Override
    @Transactional(readOnly = true)
    public List<AttendanceRespDTO> getAttendanceByStudent(Long studentId) {
        return attendanceRepository.findByStudent_Id(studentId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /*
     * Method to get attendance records by subject ID
     */
    @Override
    @Transactional(readOnly = true)
    public List<AttendanceRespDTO> getAttendanceBySubject(Long subjectId) {
        return attendanceRepository.findBySubject_Id(subjectId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /*
     * Method to get attendance records by subject ID and semester ID
     */
    @Override
    @Transactional(readOnly = true)
    public List<AttendanceRespDTO> getAttendanceBySubjectAndSemester(Long subjectId, Long semesterId) {
        return attendanceRepository.findBySubject_IdAndSemester_Id(subjectId, semesterId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /*
     * Method to delete an attendance record
     */
    @Override
    public void deleteAttendance(Long id) {
        if (!attendanceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Attendance not found with id: " + id);
        }
        attendanceRepository.deleteById(id);
    }

    /*
     * Helper method to map entity to response
     */
    private AttendanceRespDTO mapToResponse(Attendance attendance) {
        return new AttendanceRespDTO(
                attendance.getId(),
                attendance.getStudent().getId(),
                attendance.getStudent().getFullName(),
                attendance.getSubject().getId(),
                attendance.getSubject().getSubjectName(),
                attendance.getFaculty().getId(),
                attendance.getFaculty().getFullName(),
                attendance.getSemester().getId(),
                attendance.getSemester().getSemesterName(),
                attendance.getAttendanceDate(),
                attendance.getStatus()
        );
    }
}