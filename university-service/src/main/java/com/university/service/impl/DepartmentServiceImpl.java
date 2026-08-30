package com.university.service.impl;

import com.university.dto.DepartmentDTO;
import com.university.entity.Department;
import com.university.exception.DuplicateResourceException;
import com.university.exception.ResourceNotFoundException;
import com.university.repository.DepartmentRepository;
import com.university.repository.FacultyRepository;
import com.university.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final FacultyRepository facultyRepository;

    /*
     * Method to create a new department
     */
    @Override
    public DepartmentDTO createDepartment(DepartmentDTO dto) {
        if (departmentRepository.findByDeptCode(dto.getDeptCode()) != null) {
            throw new DuplicateResourceException("Department code already exists: " + dto.getDeptCode());
        }

        Department department = Department.builder()
                .deptName(dto.getDeptName())
                .deptCode(dto.getDeptCode())
                .build();
                
        if (dto.getHodId() != null) {
            department.setHod(facultyRepository.findById(dto.getHodId())
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + dto.getHodId())));
        }

        Department saved = departmentRepository.save(department);
        return mapToResponse(saved);
    }

    /*
     * Method to get department by ID
     */
    @Override
    public DepartmentDTO getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        return mapToResponse(department);
    }

    /*
     * Method to get all departments
     */
    @Override
    public List<DepartmentDTO> getAllDepartments() {
        return departmentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /*
     * Method to update department
     */
    @Override
    public DepartmentDTO updateDepartment(Long id, DepartmentDTO dto) {
        Department existing = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        existing.setDeptName(dto.getDeptName());
        existing.setDeptCode(dto.getDeptCode());
        
        if (dto.getHodId() != null) {
            existing.setHod(facultyRepository.findById(dto.getHodId())
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + dto.getHodId())));
        } else {
            existing.setHod(null);
        }

        Department updated = departmentRepository.save(existing);
        return mapToResponse(updated);
    }

    /*
     * Method to delete department
     */
    @Override
    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Department not found with id: " + id);
        }
        departmentRepository.deleteById(id);
    }
    
    private DepartmentDTO mapToResponse(Department department) {
        return new DepartmentDTO(
                department.getId(),
                department.getDeptName(),
                department.getDeptCode(),
                department.getHod() != null ? department.getHod().getId() : null
        );
    }
}