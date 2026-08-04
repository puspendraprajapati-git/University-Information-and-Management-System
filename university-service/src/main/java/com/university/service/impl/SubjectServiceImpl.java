package com.university.service.impl;

import com.university.dto.SubjectReqDTO;
import com.university.dto.SubjectRespDTO;
import com.university.entity.Department;
import com.university.entity.Semester;
import com.university.entity.Subject;
import com.university.exception.DuplicateResourceException;
import com.university.exception.ResourceNotFoundException;
import com.university.repository.DepartmentRepository;
import com.university.repository.SemesterRepository;
import com.university.repository.SubjectRepository;
import com.university.service.SubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubjectServiceImpl implements SubjectService {

    private final SubjectRepository subjectRepository;
    private final SemesterRepository semesterRepository;
    private final DepartmentRepository departmentRepository;

    /*
     * Method to create a new subject
     * Includes validation for duplicate subject code
     */
    @Override
    @Transactional
    public SubjectRespDTO createSubject(SubjectReqDTO dto) {
        if (subjectRepository.findAll().stream()
                .anyMatch(s -> s.getSubjectCode().equalsIgnoreCase(dto.getSubjectCode()))) {
            throw new DuplicateResourceException("Subject code already exists: " + dto.getSubjectCode());
        }

        Semester semester = semesterRepository.findById(dto.getSemesterId())
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with id: " + dto.getSemesterId()));

        Department department = departmentRepository.findById(dto.getDeptId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + dto.getDeptId()));

        Subject subject = Subject.builder()
                .subjectCode(dto.getSubjectCode())
                .subjectName(dto.getSubjectName())
                .semester(semester)
                .department(department)
                .syllabusPath(dto.getSyllabusPath())
                .credits(dto.getCredits())
                .build();

        Subject saved = subjectRepository.save(subject);
        return mapToResponse(saved);
    }

    /*
     * Method to get a subject by ID
     */
    @Override
    public SubjectRespDTO getSubjectById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));
        return mapToResponse(subject);
    }

    /*
     * Method to get all subjects
     */
    @Override
    public List<SubjectRespDTO> getAllSubjects() {
        return subjectRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /*
     * Method to get subjects by semester ID
     */
    @Override
    public List<SubjectRespDTO> getSubjectsBySemester(Long semesterId) {
        return subjectRepository.findBySemester_Id(semesterId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /*
     * Method to get subjects by department ID
     */
    @Override
    public List<SubjectRespDTO> getSubjectsByDepartment(Long deptId) {
        return subjectRepository.findByDepartment_Id(deptId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /*
     * Method to update an existing subject
     */
    @Override
    @Transactional
    public SubjectRespDTO updateSubject(Long id, SubjectReqDTO dto) {
        Subject existing = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));

        Semester semester = semesterRepository.findById(dto.getSemesterId())
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with id: " + dto.getSemesterId()));

        Department department = departmentRepository.findById(dto.getDeptId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + dto.getDeptId()));

        existing.setSubjectCode(dto.getSubjectCode());
        existing.setSubjectName(dto.getSubjectName());
        existing.setSemester(semester);
        existing.setDepartment(department);
        existing.setSyllabusPath(dto.getSyllabusPath());
        existing.setCredits(dto.getCredits());

        Subject updated = subjectRepository.save(existing);
        return mapToResponse(updated);
    }

    /*
     * Method to delete a subject by ID
     */
    @Override
    public void deleteSubject(Long id) {
        if (!subjectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Subject not found with id: " + id);
        }
        subjectRepository.deleteById(id);
    }

    /*
     * Helper method to map entity to DTO
     */
    private SubjectRespDTO mapToResponse(Subject subject) {
        return new SubjectRespDTO(
                subject.getId(),
                subject.getSubjectCode(),
                subject.getSubjectName(),
                subject.getSemester().getId(),
                subject.getSemester().getSemesterName(),
                subject.getDepartment().getId(),
                subject.getDepartment().getDeptName(),
                subject.getSyllabusPath(),
                subject.getCredits()
        );
    }
}