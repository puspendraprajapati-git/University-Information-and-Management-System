package com.university.service;

import com.university.dto.SubjectReqDTO;
import com.university.dto.SubjectRespDTO;
import java.util.List;

public interface SubjectService {
    SubjectRespDTO createSubject(SubjectReqDTO dto);
    SubjectRespDTO getSubjectById(Long id);
    List<SubjectRespDTO> getAllSubjects();
    List<SubjectRespDTO> getSubjectsBySemester(Long semesterId);
    List<SubjectRespDTO> getSubjectsByDepartment(Long deptId);
    SubjectRespDTO updateSubject(Long id, SubjectReqDTO dto);
    void deleteSubject(Long id);
}