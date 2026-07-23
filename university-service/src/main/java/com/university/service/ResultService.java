package com.university.service;

import com.university.dto.ResultReqDTO;
import com.university.dto.ResultRespDTO;
import com.university.dto.SemesterResultRespDTO;
import java.util.List;

public interface ResultService {
    ResultRespDTO uploadResult(ResultReqDTO dto);
    ResultRespDTO updateResult(Long id, ResultReqDTO dto);
    ResultRespDTO getResultById(Long id);
    List<ResultRespDTO> getAllResults();
    List<ResultRespDTO> getResultsByStudent(Long studentId);
    SemesterResultRespDTO getSemesterResult(Long studentId, Long semesterId);
    void deleteResult(Long id);
}