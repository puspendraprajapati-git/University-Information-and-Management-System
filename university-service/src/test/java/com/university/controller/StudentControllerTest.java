package com.university.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.university.dto.StudentReqDTO;
import com.university.dto.StudentRespDTO;
import com.university.service.StudentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class StudentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private StudentService studentService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void createStudent_returns201() throws Exception {
        StudentReqDTO reqDto = new StudentReqDTO();
        reqDto.setUserId(2L);
        reqDto.setEnrollmentNo("EN1234");
        reqDto.setFullName("John Doe");
        reqDto.setDeptId(1L);
        reqDto.setCurrentSemesterId(1L);
        reqDto.setDateOfBirth(LocalDate.of(2000, 1, 1));

        StudentRespDTO respDto = new StudentRespDTO();
        respDto.setStudentId(1L);
        respDto.setEnrollmentNo("EN1234");
        respDto.setFullName("John Doe");

        when(studentService.createStudent(any(StudentReqDTO.class))).thenReturn(respDto);

        mockMvc.perform(post("/api/students")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(reqDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fullName", org.hamcrest.Matchers.is("John Doe")));
    }

    @Test
    @WithMockUser(roles = "USER")
    void getAllStudents_returnsOk() throws Exception {
        when(studentService.getAllStudents()).thenReturn(List.of(new StudentRespDTO()));

        mockMvc.perform(get("/api/students"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateStudent_returnsOk() throws Exception {
        StudentReqDTO reqDto = new StudentReqDTO();
        reqDto.setUserId(2L);
        reqDto.setEnrollmentNo("EN1234");
        reqDto.setFullName("John Updated");
        reqDto.setDeptId(1L);
        reqDto.setCurrentSemesterId(1L);

        StudentRespDTO respDto = new StudentRespDTO();
        respDto.setStudentId(1L);
        respDto.setFullName("John Updated");

        when(studentService.updateStudent(eq(1L), any(StudentReqDTO.class))).thenReturn(respDto);

        mockMvc.perform(put("/api/students/1")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(reqDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName", org.hamcrest.Matchers.is("John Updated")));
    }
}
