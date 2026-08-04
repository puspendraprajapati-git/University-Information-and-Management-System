package com.university.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.university.dto.FacultyReqDTO;
import com.university.dto.FacultyRespDTO;
import com.university.service.FacultyService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FacultyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private FacultyService facultyService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void createFaculty_returns201() throws Exception {
        FacultyReqDTO reqDto = new FacultyReqDTO();
        reqDto.setUserId(3L);
        reqDto.setFullName("Dr. Smith");
        reqDto.setDeptId(1L);
        reqDto.setQualification("PhD in CS");

        FacultyRespDTO respDto = new FacultyRespDTO();
        respDto.setFacultyId(1L);
        respDto.setFullName("Dr. Smith");

        when(facultyService.createFaculty(any(FacultyReqDTO.class))).thenReturn(respDto);

        mockMvc.perform(post("/api/faculty")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(reqDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fullName", org.hamcrest.Matchers.is("Dr. Smith")));
    }

    @Test
    @WithMockUser(roles = "USER")
    void getAllFaculty_returnsOk() throws Exception {
        when(facultyService.getAllFaculty()).thenReturn(List.of(new FacultyRespDTO()));

        mockMvc.perform(get("/api/faculty"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateFaculty_returnsOk() throws Exception {
        FacultyReqDTO reqDto = new FacultyReqDTO();
        reqDto.setUserId(3L);
        reqDto.setFullName("Dr. Smith Updated");
        reqDto.setDeptId(1L);
        reqDto.setQualification("PhD in CS");

        FacultyRespDTO respDto = new FacultyRespDTO();
        respDto.setFacultyId(1L);
        respDto.setFullName("Dr. Smith Updated");

        when(facultyService.updateFaculty(eq(1L), any(FacultyReqDTO.class))).thenReturn(respDto);

        mockMvc.perform(put("/api/faculty/1")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(reqDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName", org.hamcrest.Matchers.is("Dr. Smith Updated")));
    }
}
