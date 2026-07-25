package com.university.service.impl;

import com.university.dto.LoginRequestDTO;
import com.university.dto.RegisterRequestDTO;
import com.university.dto.UserResponseDTO;
import com.university.entity.Users;
import com.university.exception.DuplicateResourceException;
import com.university.exception.InvalidCredentialsException;
import com.university.exception.ResourceNotFoundException;
import com.university.repository.UsersRepository;
import com.university.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;

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
        return mapToResponse(saved);
    }

    @Override
    public UserResponseDTO login(LoginRequestDTO request) {
        Users user = usersRepository.findByUsername(request.getUsername());
        if (user == null) {
            throw new InvalidCredentialsException("Invalid username or password");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid username or password");
        }
        return mapToResponse(user);
        // NOTE: JWT token generation will be added here in the final Authentication phase.
        // For now, login just validates credentials and returns user info.
    }

    @Override
    public UserResponseDTO getUserById(Long id) {
        Users user = usersRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToResponse(user);
    }

    @Override
    public List<UserResponseDTO> getAllUsers() {
        return usersRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteUser(Long id) {
        if (!usersRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        usersRepository.deleteById(id);
    }

    private UserResponseDTO mapToResponse(Users user) {
        return new UserResponseDTO(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getProfileImage()
        );
    }
}