package com.university.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.university.dto.SubjectReqDTO;
import com.university.dto.SubjectRespDTO;
import com.university.service.SubjectService;
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
class SubjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SubjectService subjectService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void createSubject_returns201() throws Exception {
        SubjectReqDTO reqDto = new SubjectReqDTO();
        reqDto.setSubjectCode("CS101");
        reqDto.setSubjectName("Intro to CS");
        reqDto.setSemesterId(1L);
        reqDto.setDeptId(1L);

        SubjectRespDTO respDto = new SubjectRespDTO();
        respDto.setSubjectId(1L);
        respDto.setSubjectCode("CS101");
        respDto.setSubjectName("Intro to CS");

        when(subjectService.createSubject(any(SubjectReqDTO.class))).thenReturn(respDto);

        mockMvc.perform(post("/api/subjects")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(reqDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.subjectName", org.hamcrest.Matchers.is("Intro to CS")));
    }

    @Test
    @WithMockUser(roles = "USER")
    void getAllSubjects_returnsOk() throws Exception {
        when(subjectService.getAllSubjects()).thenReturn(List.of(new SubjectRespDTO()));

        mockMvc.perform(get("/api/subjects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "FACULTY")
    void updateSubject_returnsOk() throws Exception {
        SubjectReqDTO reqDto = new SubjectReqDTO();
        reqDto.setSubjectCode("CS101");
        reqDto.setSubjectName("Intro to CS Updated");
        reqDto.setSemesterId(1L);
        reqDto.setDeptId(1L);

        SubjectRespDTO respDto = new SubjectRespDTO();
        respDto.setSubjectId(1L);
        respDto.setSubjectName("Intro to CS Updated");

        when(subjectService.updateSubject(eq(1L), any(SubjectReqDTO.class))).thenReturn(respDto);

        mockMvc.perform(put("/api/subjects/1")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(reqDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subjectName", org.hamcrest.Matchers.is("Intro to CS Updated")));
    }
}
