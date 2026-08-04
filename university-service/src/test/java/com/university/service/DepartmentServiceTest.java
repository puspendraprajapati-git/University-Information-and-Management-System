package com.university.service;

import com.university.dto.DepartmentDTO;
import com.university.entity.Department;
import com.university.exception.DuplicateResourceException;
import com.university.exception.ResourceNotFoundException;
import com.university.repository.DepartmentRepository;
import com.university.service.impl.DepartmentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DepartmentServiceTest {

    @Mock
    private DepartmentRepository departmentRepository;

    private DepartmentServiceImpl departmentService;

    private Department department;
    private DepartmentDTO departmentDTO;

    @BeforeEach
    void setUp() {

        departmentService = new DepartmentServiceImpl(
                departmentRepository
        );

        department = new Department();
        department.setId(1L);
        department.setDeptName("Computer Engineering");
        department.setDeptCode("CE");

        departmentDTO = new DepartmentDTO(
                1L,
                "Computer Engineering",
                "CE",
                null
        );
    }

    @Test
    void createDepartment_success() {

        when(departmentRepository.findByDeptCode("CE")).thenReturn(null);
        when(departmentRepository.save(any(Department.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        DepartmentDTO result = departmentService.createDepartment(departmentDTO);

        assertThat(result).isNotNull();
        assertThat(result.getDeptName()).isEqualTo("Computer Engineering");
        assertThat(result.getDeptCode()).isEqualTo("CE");

        verify(departmentRepository).save(any(Department.class));
    }

    @Test
    void createDepartment_duplicateCode_throwsException() {

        when(departmentRepository.findByDeptCode("CE"))
                .thenReturn(department);

        assertThatThrownBy(() -> departmentService.createDepartment(departmentDTO))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Department code already exists");

        verify(departmentRepository, never()).save(any());
    }

    @Test
    void getDepartmentById_success() {

        when(departmentRepository.findById(1L))
                .thenReturn(Optional.of(department));

        DepartmentDTO result = departmentService.getDepartmentById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getDeptId()).isEqualTo(1L);
        assertThat(result.getDeptName()).isEqualTo("Computer Engineering");
        assertThat(result.getDeptCode()).isEqualTo("CE");
    }

    @Test
    void getDepartmentById_notFound_throwsException() {

        when(departmentRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> departmentService.getDepartmentById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Department not found with id: 99");
    }

    @Test
    void getAllDepartments_returnsList() {

        when(departmentRepository.findAll())
                .thenReturn(List.of(department));

        List<DepartmentDTO> result = departmentService.getAllDepartments();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDeptName()).isEqualTo("Computer Engineering");
        assertThat(result.get(0).getDeptCode()).isEqualTo("CE");
    }

    @Test
    void updateDepartment_success() {

        DepartmentDTO updateDto = new DepartmentDTO(
                null,
                "CSE Updated",
                "CSE",
                10L
        );

        when(departmentRepository.findById(1L))
                .thenReturn(Optional.of(department));

        when(departmentRepository.save(any(Department.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        DepartmentDTO result = departmentService.updateDepartment(1L, updateDto);

        assertThat(result).isNotNull();
        assertThat(result.getDeptName()).isEqualTo("CSE Updated");
        assertThat(result.getDeptCode()).isEqualTo("CSE");
        assertThat(result.getHodId()).isEqualTo(10L);

        verify(departmentRepository).save(any(Department.class));
    }

    @Test
    void updateDepartment_notFound_throwsException() {

        when(departmentRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                departmentService.updateDepartment(99L, departmentDTO))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Department not found with id: 99");
    }

    @Test
    void deleteDepartment_success() {

        when(departmentRepository.existsById(1L))
                .thenReturn(true);

        departmentService.deleteDepartment(1L);

        verify(departmentRepository).deleteById(1L);
    }

    @Test
    void deleteDepartment_notFound_throwsException() {

        when(departmentRepository.existsById(99L))
                .thenReturn(false);

        assertThatThrownBy(() ->
                departmentService.deleteDepartment(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Department not found with id: 99");

        verify(departmentRepository, never()).deleteById(any());
    }
}
