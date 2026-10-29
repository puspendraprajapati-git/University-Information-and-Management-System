package com.university.lms.service.impl;

import com.university.lms.dto.AssignmentReqDTO;
import com.university.lms.dto.AssignmentRespDTO;
import com.university.lms.entity.Assignment;
import com.university.lms.exception.ResourceNotFoundException;
import com.university.lms.repository.AssignmentRepository;
import com.university.lms.repository.SubmissionRepository;
import com.university.lms.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AssignmentServiceImpl implements AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;

    @Override
    public AssignmentRespDTO createAssignment(AssignmentReqDTO dto) {
        Assignment assignment = Assignment.builder()
                .subjectId(dto.getSubjectId())
                .facultyId(dto.getFacultyId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .dueDate(dto.getDueDate())
                .maxMarks(dto.getMaxMarks() != null ? dto.getMaxMarks() : 100)
                .build();

        Assignment saved = assignmentRepository.save(assignment);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AssignmentRespDTO getAssignmentById(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + assignmentId));
        return mapToDTO(assignment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentRespDTO> getAllAssignments() {
        return assignmentRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentRespDTO> getAssignmentsBySubject(Long subjectId) {
        return assignmentRepository.findBySubjectIdOrderByCreatedAtDesc(subjectId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentRespDTO> getAssignmentsByFaculty(Long facultyId) {
        return assignmentRepository.findByFacultyIdOrderByCreatedAtDesc(facultyId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteAssignment(Long assignmentId) {
        if (!assignmentRepository.existsById(assignmentId)) {
            throw new ResourceNotFoundException("Assignment not found with id: " + assignmentId);
        }
        assignmentRepository.deleteById(assignmentId);
    }

    private AssignmentRespDTO mapToDTO(Assignment a) {
        long count = submissionRepository.countByAssignmentId(a.getAssignmentId());
        return AssignmentRespDTO.builder()
                .assignmentId(a.getAssignmentId())
                .subjectId(a.getSubjectId())
                .facultyId(a.getFacultyId())
                .title(a.getTitle())
                .description(a.getDescription())
                .dueDate(a.getDueDate())
                .maxMarks(a.getMaxMarks())
                .createdAt(a.getCreatedAt())
                .submissionCount(count)
                .build();
    }
}
