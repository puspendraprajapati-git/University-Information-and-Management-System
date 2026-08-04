package com.university.service.impl;

import com.university.dto.LoginRequestDTO;
import com.university.dto.LoginResponseDTO;
import com.university.dto.RegisterRequestDTO;
import com.university.dto.UserResponseDTO;
import com.university.entity.Users;
import com.university.exception.DuplicateResourceException;
import com.university.exception.InvalidCredentialsException;
import com.university.exception.ResourceNotFoundException;
import com.university.repository.UsersRepository;
import com.university.security.JwtUtil;
import com.university.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import com.university.enums.Role;
import com.university.entity.Student;
import com.university.entity.Faculty;
import com.university.entity.Department;
import com.university.repository.StudentRepository;
import com.university.repository.FacultyRepository;
import com.university.repository.DepartmentRepository;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final DepartmentRepository departmentRepository;

    /*
     * Method to register a new user
     */
    @Override
    public UserResponseDTO register(RegisterRequestDTO request) {
        if (usersRepository.findByUsername(request.getUsername()) != null) {
            throw new DuplicateResourceException("Username already exists");
        }
        if (usersRepository.findByEmail(request.getEmail()) != null) {
            throw new DuplicateResourceException("Email already exists");
        }

        Users user = Users.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .role(request.getRole())
                .profileImage(request.getProfileImage())
                .build();

        Users saved = usersRepository.save(user);

        // Auto-create corresponding profile based on role
        if (saved.getRole() == Role.STUDENT) {
            Department defaultDept = departmentRepository.findAll().stream().findFirst().orElse(null);
            if (defaultDept != null) {
                Student student = Student.builder()
                        .user(saved)
                        .fullName(saved.getUsername())
                        .enrollmentNo("STU" + System.currentTimeMillis())
                        .department(defaultDept)
                        .currentSemester(1)
                        .build();
                studentRepository.save(student);
            }
        } else if (saved.getRole() == Role.FACULTY) {
            Department defaultDept = departmentRepository.findAll().stream().findFirst().orElse(null);
            if (defaultDept != null) {
                Faculty faculty = Faculty.builder()
                        .user(saved)
                        .fullName(saved.getUsername())
                        .department(defaultDept)
                        .qualification("TBD")
                        .build();
                facultyRepository.save(faculty);
            }
        }

        return mapToResponse(saved);
    }

    /*
     * Method to authenticate a user and generate JWT token
     */
    @Override
    public LoginResponseDTO login(LoginRequestDTO request) {
        Users user = usersRepository.findByUsername(request.getUsername());
        if (user == null) {
            throw new InvalidCredentialsException("Invalid username or password");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name(), user.getId());

        return new LoginResponseDTO(token, user.getId(), user.getUsername(), user.getRole());
    }

    /*
     * Method to get user by ID
     */
    @Override
    public UserResponseDTO getUserById(Long id) {
        Users user = usersRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToResponse(user);
    }

    /*
     * Method to get all users
     */
    @Override
    public List<UserResponseDTO> getAllUsers() {
        return usersRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /*
     * Method to delete a user
     */
    @Override
    public void deleteUser(Long id) {
        if (!usersRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        usersRepository.deleteById(id);
    }

    /*
     * Helper method to map entity to response
     */
    private UserResponseDTO mapToResponse(Users user) {
        return new UserResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getProfileImage());
    }
}