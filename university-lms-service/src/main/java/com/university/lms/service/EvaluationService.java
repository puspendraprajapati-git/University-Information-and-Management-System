package com.university.lms.service;

import com.university.lms.dto.EvaluationReqDTO;
import com.university.lms.dto.EvaluationRespDTO;

public interface EvaluationService {

    EvaluationRespDTO evaluateSubmission(EvaluationReqDTO dto);

    EvaluationRespDTO getEvaluationBySubmissionId(Long submissionId);
}
