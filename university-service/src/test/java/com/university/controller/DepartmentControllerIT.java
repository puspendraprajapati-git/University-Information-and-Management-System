package com.university.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.university.dto.DepartmentDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test") // uses application-test.properties → H2 in-memory DB
class DepartmentControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createDepartment_returns201_andPersists() throws Exception {
        DepartmentDTO dto = new DepartmentDTO(null, "Mechanical Engineering", "ME", null);

        mockMvc.perform(post("/api/departments")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.deptName", is("Mechanical Engineering")))
                .andExpect(jsonPath("$.deptCode", is("ME")));
    }

    @Test
    void createDepartment_missingName_returns400WithValidationError() throws Exception {
        DepartmentDTO dto = new DepartmentDTO(null, "", "XX", null);

        mockMvc.perform(post("/api/departments")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.deptName").exists());
    }

    @Test
    void getDepartmentById_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/departments/9999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)));
    }

    @Test
    void createDuplicateDeptCode_returns409() throws Exception {
        DepartmentDTO dto = new DepartmentDTO(null, "Civil Engineering", "CIV", null);

        // first creation succeeds
        mockMvc.perform(post("/api/departments")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());

        // second creation with same code fails
        mockMvc.perform(post("/api/departments")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isConflict());
    }

    @Test
    void getAllDepartments_returnsOkAndList() throws Exception {
        mockMvc.perform(get("/api/departments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
