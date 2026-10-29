package com.university.lms.service;

import com.university.lms.dto.SubmissionRespDTO;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface SubmissionService {

    SubmissionRespDTO submitAssignment(Long assignmentId, Long studentId, MultipartFile file);

    List<SubmissionRespDTO> getSubmissionsByAssignment(Long assignmentId);

    List<SubmissionRespDTO> getSubmissionsByStudent(Long studentId);

    SubmissionRespDTO getSubmissionById(Long submissionId);

    Resource getSubmissionFile(Long submissionId);

    String getSubmissionOriginalFileName(Long submissionId);
}
