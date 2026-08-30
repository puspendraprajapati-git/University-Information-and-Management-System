package com.university.service.impl;

import com.university.dto.StudentReqDTO;
import com.university.dto.StudentRespDTO;
import com.university.entity.Department;
import com.university.entity.Student;
import com.university.entity.Users;
import com.university.enums.Role;
import com.university.exception.DuplicateResourceException;
import com.university.exception.ResourceNotFoundException;
import com.university.repository.DepartmentRepository;
import com.university.repository.SemesterRepository;
import com.university.repository.StudentRepository;
import com.university.repository.UsersRepository;
import com.university.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final UsersRepository usersRepository;
    private final DepartmentRepository departmentRepository;
    private final SemesterRepository semesterRepository;

    /*
     * Method to create a new student
     */
    @Override
    @Transactional
    public StudentRespDTO createStudent(StudentReqDTO dto) {
        Users user = usersRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getUserId()));

        if (user.getRole() != Role.STUDENT) {
            throw new IllegalArgumentException("User role must be STUDENT to create a student profile");
        }

        if (studentRepository.existsById(dto.getUserId())) {
            throw new DuplicateResourceException("Student profile already exists for this user");
        }

        if (studentRepository.findByEnrollmentNo(dto.getEnrollmentNo()) != null) {
            throw new DuplicateResourceException("Enrollment number already exists: " + dto.getEnrollmentNo());
        }

        Department department = departmentRepository.findById(dto.getDeptId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + dto.getDeptId()));

        Student student = Student.builder()
                .user(user)
                .enrollmentNo(dto.getEnrollmentNo())
                .fullName(dto.getFullName())
                .department(department)
                .currentSemester(dto.getCurrentSemesterId() != null ? dto.getCurrentSemesterId().intValue() : 1)
                .dateOfBirth(dto.getDateOfBirth())
                .build();

        Student saved = studentRepository.save(student);
        return mapToResponse(saved);
    }

    /*
     * Method to get student by ID
     */
    @Override
    public StudentRespDTO getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        return mapToResponse(student);
    }

    /*
     * Method to get student by User ID
     */
    @Override
    public StudentRespDTO getStudentByUserId(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user id: " + userId));
        return mapToResponse(student);
    }

    /*
     * Method to get all students
     */
    @Override
    public List<StudentRespDTO> getAllStudents() {
        return studentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /*
     * Method to update existing student
     */
    @Override
    @Transactional
    public StudentRespDTO updateStudent(Long id, StudentReqDTO dto) {
        Student existing = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        Department department = departmentRepository.findById(dto.getDeptId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + dto.getDeptId()));

        existing.setFullName(dto.getFullName());
        existing.setEnrollmentNo(dto.getEnrollmentNo());
        existing.setDepartment(department);
        if (dto.getCurrentSemesterId() != null) {
            existing.setCurrentSemester(dto.getCurrentSemesterId().intValue());
        }
        existing.setDateOfBirth(dto.getDateOfBirth());

        Student updated = studentRepository.save(existing);
        return mapToResponse(updated);
    }

    /*
     * Method to delete a student
     */
    @Override
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Student not found with id: " + id);
        }
        studentRepository.deleteById(id);
    }

    /*
     * Method to search student by name
     */
    @Override
    public List<StudentRespDTO> searchByName(String name) {
        return studentRepository.findAll()
                .stream()
                .filter(s -> s.getFullName().toLowerCase().contains(name.toLowerCase()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /*
     * Helper method to map entity to response
     */
    private StudentRespDTO mapToResponse(Student student) {
        String username = student.getUser() != null ? student.getUser().getUsername() : "N/A";
        String email = student.getUser() != null ? student.getUser().getEmail() : "N/A";
        
        return new StudentRespDTO(
                student.getId(),
                student.getEnrollmentNo(),
                student.getFullName(),
                student.getDepartment() != null ? student.getDepartment().getId() : null,
                student.getDepartment() != null ? student.getDepartment().getDeptName() : "N/A",
                student.getCurrentSemester() != null ? student.getCurrentSemester().longValue() : null,
                student.getDateOfBirth(),
                username,
                email
        );
    }
}