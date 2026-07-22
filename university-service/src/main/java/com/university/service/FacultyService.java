package com.university.service;

import com.university.dto.FacultyReqDTO;
import com.university.dto.FacultyRespDTO;
import java.util.List;

public interface FacultyService {
    FacultyRespDTO createFaculty(FacultyReqDTO dto);
    FacultyRespDTO getFacultyById(Long id);
    List<FacultyRespDTO> getAllFaculty();
    FacultyRespDTO updateFaculty(Long id, FacultyReqDTO dto);
    void deleteFaculty(Long id);
}