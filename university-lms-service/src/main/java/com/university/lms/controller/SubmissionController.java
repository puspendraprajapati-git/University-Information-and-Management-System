package com.university.lms.controller;

import com.university.lms.dto.SubmissionRespDTO;
import com.university.lms.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping({"/lms/submissions", "/submissions"})
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    /*
     * URI - /lms/submissions
     * Method - POST (Multipart)
     * Params - assignmentId, studentId, file
     * Success resp - SC 201 + SubmissionRespDTO
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SubmissionRespDTO> submitAssignment(
            @RequestParam("assignmentId") Long assignmentId,
            @RequestParam("studentId") Long studentId,
            @RequestParam("file") MultipartFile file) {
        System.out.println("in submit assignment: assignmentId=" + assignmentId + ", studentId=" + studentId);
        return new ResponseEntity<>(submissionService.submitAssignment(assignmentId, studentId, file), HttpStatus.CREATED);
    }

    /*
     * URI - /lms/submissions/assignment/{assignmentId}
     * Method - GET
     * Success resp - SC 200 + List<SubmissionRespDTO>
     */
    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<List<SubmissionRespDTO>> getSubmissionsByAssignment(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(submissionService.getSubmissionsByAssignment(assignmentId));
    }

    /*
     * URI - /lms/submissions/student/{studentId}
     * Method - GET
     * Success resp - SC 200 + List<SubmissionRespDTO>
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<SubmissionRespDTO>> getSubmissionsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(submissionService.getSubmissionsByStudent(studentId));
    }

    /*
     * URI - /lms/submissions/{submissionId}
     * Method - GET
     * Success resp - SC 200 + SubmissionRespDTO
     */
    @GetMapping("/{submissionId}")
    public ResponseEntity<SubmissionRespDTO> getSubmissionById(@PathVariable Long submissionId) {
        return ResponseEntity.ok(submissionService.getSubmissionById(submissionId));
    }

    /*
     * URI - /lms/submissions/download/{submissionId}
     * Method - GET
     * Success resp - SC 200 + Resource (File stream)
     */
    @GetMapping("/download/{submissionId}")
    public ResponseEntity<Resource> downloadSubmissionFile(@PathVariable Long submissionId) {
        Resource resource = submissionService.getSubmissionFile(submissionId);
        String fileName = submissionService.getSubmissionOriginalFileName(submissionId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(resource);
    }
}
