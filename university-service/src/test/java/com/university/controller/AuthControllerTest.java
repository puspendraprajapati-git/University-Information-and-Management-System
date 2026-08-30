package com.university.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.university.dto.LoginRequestDTO;
import com.university.dto.RegisterRequestDTO;
import com.university.enums.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registerUser_returns201() throws Exception {
        RegisterRequestDTO dto = new RegisterRequestDTO();
        dto.setUsername("newuser");
        dto.setEmail("newuser@example.com");
        dto.setPassword("password123");
        dto.setConfirmPassword("password123");
        dto.setRole(Role.STUDENT);

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username", is("newuser")))
                .andExpect(jsonPath("$.email", is("newuser@example.com")))
                .andExpect(jsonPath("$.role", is("ROLE_STUDENT")));
    }

    @Test
    void registerUser_missingFields_returns400() throws Exception {
        RegisterRequestDTO dto = new RegisterRequestDTO();
        dto.setUsername("");
        dto.setEmail("invalid");
        dto.setPassword("");
        dto.setRole(null);

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void loginUser_returns200AndToken() throws Exception {
        // First register a user
        RegisterRequestDTO registerDto = new RegisterRequestDTO();
        registerDto.setUsername("loginuser");
        registerDto.setEmail("login@example.com");
        registerDto.setPassword("password123");
        registerDto.setConfirmPassword("password123");
        registerDto.setRole(Role.STUDENT);
        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerDto)))
                .andExpect(status().isCreated());

        // Then login
        LoginRequestDTO loginDto = new LoginRequestDTO();
        loginDto.setEmail("login@example.com");
        loginDto.setPassword("password123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.username", is("loginuser")))
                .andExpect(jsonPath("$.role", is("ROLE_STUDENT")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllUsers_asAdmin_returnsOk() throws Exception {
        mockMvc.perform(get("/api/auth/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "USER")
    void getAllUsers_asUser_returns403() throws Exception {
        mockMvc.perform(get("/api/auth/users"))
                .andExpect(status().isForbidden());
    }
}
