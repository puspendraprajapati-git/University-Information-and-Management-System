package com.university.service;

import com.university.dto.LoginRequestDTO;
import com.university.dto.RegisterRequestDTO;
import com.university.dto.UserResponseDTO;

import java.util.List;

public interface UserService {
    UserResponseDTO register(RegisterRequestDTO request);
    UserResponseDTO login(LoginRequestDTO request);
    UserResponseDTO getUserById(Long id);
    List<UserResponseDTO> getAllUsers();
    void deleteUser(Long id);
}