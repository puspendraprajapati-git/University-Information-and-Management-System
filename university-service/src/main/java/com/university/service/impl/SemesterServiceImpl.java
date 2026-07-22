package com.university.service.impl;

import com.university.dto.SemesterDTO;
import com.university.entity.Semester;
import com.university.exception.ResourceNotFoundException;
import com.university.repository.SemesterRepository;
import com.university.service.SemesterService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SemesterServiceImpl implements SemesterService {

    private final SemesterRepository semesterRepository;
    private final ModelMapper modelMapper;

    @Override
    public SemesterDTO createSemester(SemesterDTO dto) {
        Semester semester = modelMapper.map(dto, Semester.class);
        semester.setSemesterId(null); // ensure insert, not update

        Semester saved = semesterRepository.save(semester);
        return modelMapper.map(saved, SemesterDTO.class);
    }

    @Override
    public SemesterDTO getSemesterById(Long id) {
        Semester semester = semesterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with id: " + id));
        return modelMapper.map(semester, SemesterDTO.class);
    }

    @Override
    public List<SemesterDTO> getAllSemesters() {
        return semesterRepository.findAll()
                .stream()
                .map(sem -> modelMapper.map(sem, SemesterDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public SemesterDTO updateSemester(Long id, SemesterDTO dto) {
        Semester existing = semesterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with id: " + id));

        existing.setSemesterName(dto.getSemesterName());
        existing.setStartDate(dto.getStartDate());
        existing.setEndDate(dto.getEndDate());
        existing.setYear(dto.getYear());

        Semester updated = semesterRepository.save(existing);
        return modelMapper.map(updated, SemesterDTO.class);
    }

    @Override
    public void deleteSemester(Long id) {
        if (!semesterRepository.existsById(id)) {
            throw new ResourceNotFoundException("Semester not found with id: " + id);
        }
        semesterRepository.deleteById(id);
    }
}