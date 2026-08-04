package com.university.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.university.dto.SemesterDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import com.university.service.SemesterService;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SemesterControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SemesterService semesterService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void createSemester_returns201() throws Exception {
        SemesterDTO dto = new SemesterDTO(null, "Fall 2026", LocalDate.of(2026, 8, 1), LocalDate.of(2026, 12, 15), 2026);
        SemesterDTO createdDto = new SemesterDTO(1L, "Fall 2026", LocalDate.of(2026, 8, 1), LocalDate.of(2026, 12, 15), 2026);

        when(semesterService.createSemester(any(SemesterDTO.class))).thenReturn(createdDto);

        mockMvc.perform(post("/api/semesters")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.semesterName", is("Fall 2026")));
    }

    @Test
    @WithMockUser(roles = "USER") // User cannot create semester
    void createSemester_asUser_returns403() throws Exception {
        SemesterDTO dto = new SemesterDTO(null, "Fall 2026", LocalDate.of(2026, 8, 1), LocalDate.of(2026, 12, 15), 2026);

        mockMvc.perform(post("/api/semesters")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "USER")
    void getAllSemesters_returnsOk() throws Exception {
        when(semesterService.getAllSemesters()).thenReturn(List.of(new SemesterDTO()));

        mockMvc.perform(get("/api/semesters"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateSemester_returnsOk() throws Exception {
        SemesterDTO updatedDto = new SemesterDTO(1L, "Spring 2026 Updated", LocalDate.of(2026, 1, 1), LocalDate.of(2026, 5, 15), 2026);
        
        when(semesterService.updateSemester(eq(1L), any(SemesterDTO.class))).thenReturn(updatedDto);

        mockMvc.perform(put("/api/semesters/1")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(updatedDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.semesterName", is("Spring 2026 Updated")));
    }
}
