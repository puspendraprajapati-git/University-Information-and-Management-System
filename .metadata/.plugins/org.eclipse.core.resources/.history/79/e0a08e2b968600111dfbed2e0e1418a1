package com.university.service.impl;

import com.university.dto.DepartmentDTO;
import com.university.entity.Department;
import com.university.exception.DuplicateResourceException;
import com.university.exception.ResourceNotFoundException;
import com.university.repository.DepartmentRepository;
import com.university.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final ModelMapper modelMapper;

    @Override
    public DepartmentDTO createDepartment(DepartmentDTO dto) {
        if (departmentRepository.findByDeptCode(dto.getDeptCode()) != null) {
            throw new DuplicateResourceException("Department code already exists: " + dto.getDeptCode());
        }

        Department department = modelMapper.map(dto, Department.class);
        department.setDeptId(null); // ensure insert, not update

        Department saved = departmentRepository.save(department);
        return modelMapper.map(saved, DepartmentDTO.class);
    }

    @Override
    public DepartmentDTO getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        return modelMapper.map(department, DepartmentDTO.class);
    }

    @Override
    public List<DepartmentDTO> getAllDepartments() {
        return departmentRepository.findAll()
                .stream()
                .map(dept -> modelMapper.map(dept, DepartmentDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public DepartmentDTO updateDepartment(Long id, DepartmentDTO dto) {
        Department existing = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        existing.setDeptName(dto.getDeptName());
        existing.setDeptCode(dto.getDeptCode());
        existing.setHodId(dto.getHodId());

        Department updated = departmentRepository.save(existing);
        return modelMapper.map(updated, DepartmentDTO.class);
    }

    @Override
    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Department not found with id: " + id);
        }
        departmentRepository.deleteById(id);
    }
}