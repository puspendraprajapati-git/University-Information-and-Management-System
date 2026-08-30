package com.university.service;

import com.university.dto.StudentReqDTO;
import com.university.dto.StudentRespDTO;
import java.util.List;

public interface StudentService {
    StudentRespDTO createStudent(StudentReqDTO dto);
    StudentRespDTO getStudentById(Long id);
    StudentRespDTO getStudentByUserId(Long userId);
    List<StudentRespDTO> getAllStudents();
    StudentRespDTO updateStudent(Long id, StudentReqDTO dto);
    void deleteStudent(Long id);
    List<StudentRespDTO> searchByName(String name);
}