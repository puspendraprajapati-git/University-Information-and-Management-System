package com.university.lms.service;

import com.university.lms.dto.AssignmentReqDTO;
import com.university.lms.dto.AssignmentRespDTO;

import java.util.List;

public interface AssignmentService {

    AssignmentRespDTO createAssignment(AssignmentReqDTO dto);

    AssignmentRespDTO getAssignmentById(Long assignmentId);

    List<AssignmentRespDTO> getAllAssignments();

    List<AssignmentRespDTO> getAssignmentsBySubject(Long subjectId);

    List<AssignmentRespDTO> getAssignmentsByFaculty(Long facultyId);

    void deleteAssignment(Long assignmentId);
}
