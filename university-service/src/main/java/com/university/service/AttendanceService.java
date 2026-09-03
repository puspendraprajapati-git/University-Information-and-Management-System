package com.university.service;

import com.university.dto.AttendanceReqDTO;
import com.university.dto.AttendanceRespDTO;
import java.util.List;

public interface AttendanceService {
    AttendanceRespDTO markAttendance(AttendanceReqDTO dto);
    AttendanceRespDTO updateAttendance(Long id, AttendanceReqDTO dto);
    AttendanceRespDTO getAttendanceById(Long id);
    List<AttendanceRespDTO> getAllAttendance();
    List<AttendanceRespDTO> getAttendanceByStudent(Long studentId);
    List<AttendanceRespDTO> getAttendanceBySubject(Long subjectId);
    List<AttendanceRespDTO> getAttendanceBySubjectAndSemester(Long subjectId, Long semesterId);
    void deleteAttendance(Long id);
}