package com.university.service.impl;

import com.university.dto.SemesterDTO;
import com.university.entity.Semester;
import com.university.exception.ResourceNotFoundException;
import com.university.repository.SemesterRepository;
import com.university.service.SemesterService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SemesterServiceImpl implements SemesterService {

    private final SemesterRepository semesterRepository;

    /*
     * Method to create a semester
     */
    @Override
    public SemesterDTO createSemester(SemesterDTO dto) {
        Semester semester = Semester.builder()
                .semesterName(dto.getSemesterName())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .year(dto.getYear())
                .build();

        Semester saved = semesterRepository.save(semester);
        return mapToResponse(saved);
    }

    /*
     * Method to get semester by ID
     */
    @Override
    public SemesterDTO getSemesterById(Long id) {
        Semester semester = semesterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with id: " + id));
        return mapToResponse(semester);
    }

    /*
     * Method to get all semesters
     */
    @Override
    public List<SemesterDTO> getAllSemesters() {
        return semesterRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /*
     * Method to update an existing semester
     */
    @Override
    public SemesterDTO updateSemester(Long id, SemesterDTO dto) {
        Semester existing = semesterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with id: " + id));

        existing.setSemesterName(dto.getSemesterName());
        existing.setStartDate(dto.getStartDate());
        existing.setEndDate(dto.getEndDate());
        existing.setYear(dto.getYear());

        Semester updated = semesterRepository.save(existing);
        return mapToResponse(updated);
    }

    /*
     * Method to delete a semester
     */
    @Override
    public void deleteSemester(Long id) {
        if (!semesterRepository.existsById(id)) {
            throw new ResourceNotFoundException("Semester not found with id: " + id);
        }
        semesterRepository.deleteById(id);
    }
    
    private SemesterDTO mapToResponse(Semester semester) {
        return new SemesterDTO(
                semester.getId(),
                semester.getSemesterName(),
                semester.getStartDate(),
                semester.getEndDate(),
                semester.getYear()
        );
    }
}