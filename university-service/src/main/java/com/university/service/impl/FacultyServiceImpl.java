package com.university.service.impl;

import com.university.dto.FacultyReqDTO;
import com.university.dto.FacultyRespDTO;
import com.university.entity.Department;
import com.university.entity.Faculty;
import com.university.entity.Users;
import com.university.enums.Role;
import com.university.exception.DuplicateResourceException;
import com.university.exception.ResourceNotFoundException;
import com.university.repository.DepartmentRepository;
import com.university.repository.FacultyRepository;
import com.university.repository.UsersRepository;
import com.university.service.FacultyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacultyServiceImpl implements FacultyService {

    private final FacultyRepository facultyRepository;
    private final UsersRepository usersRepository;
    private final DepartmentRepository departmentRepository;

    /*
     * Method to create a new faculty profile
     */
    @Override
    @Transactional
    public FacultyRespDTO createFaculty(FacultyReqDTO dto) {
        Users user = usersRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getUserId()));

        if (user.getRole() != Role.FACULTY) {
            throw new IllegalArgumentException("User role must be FACULTY to create a faculty profile");
        }

        if (facultyRepository.existsById(dto.getUserId())) {
            throw new DuplicateResourceException("Faculty profile already exists for this user");
        }

        Department department = departmentRepository.findById(dto.getDeptId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + dto.getDeptId()));

        Faculty faculty = Faculty.builder()
                .user(user)
                .fullName(dto.getFullName())
                .department(department)
                .qualification(dto.getQualification())
                .build();

        Faculty saved = facultyRepository.save(faculty);
        return mapToResponse(saved);
    }

    /*
     * Method to get faculty by ID
     */
    @Override
    public FacultyRespDTO getFacultyById(Long id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + id));
        return mapToResponse(faculty);
    }

    /*
     * Method to get all faculty
     */
    @Override
    public List<FacultyRespDTO> getAllFaculty() {
        return facultyRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /*
     * Method to update existing faculty
     */
    @Override
    @Transactional
    public FacultyRespDTO updateFaculty(Long id, FacultyReqDTO dto) {
        Faculty existing = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + id));

        Department department = departmentRepository.findById(dto.getDeptId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + dto.getDeptId()));

        existing.setFullName(dto.getFullName());
        existing.setDepartment(department);
        existing.setQualification(dto.getQualification());

        Faculty updated = facultyRepository.save(existing);
        return mapToResponse(updated);
    }

    /*
     * Method to delete a faculty profile
     */
    @Override
    public void deleteFaculty(Long id) {
        if (!facultyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Faculty not found with id: " + id);
        }
        facultyRepository.deleteById(id);
    }

    /*
     * Helper method to map entity to response
     */
    private FacultyRespDTO mapToResponse(Faculty faculty) {
        return new FacultyRespDTO(
                faculty.getId(),
                faculty.getFullName(),
                faculty.getDepartment().getId(),
                faculty.getDepartment().getDeptName(),
                faculty.getQualification(),
                faculty.getUser().getUsername(),
                faculty.getUser().getEmail()
        );
    }
}