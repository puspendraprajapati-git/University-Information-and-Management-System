package com.university.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.university.dto.ResultReqDTO;
import com.university.dto.ResultRespDTO;
import com.university.service.ResultService;
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
class ResultControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ResultService resultService;

    @Test
    @WithMockUser(roles = "FACULTY")
    void addResult_returns201() throws Exception {
        ResultReqDTO reqDto = new ResultReqDTO();
        reqDto.setStudentId(1L);
        reqDto.setSubjectId(1L);
        reqDto.setSemesterId(1L);
        reqDto.setTheoryMarks(85);
        reqDto.setPracticalMarks(90);

        ResultRespDTO respDto = new ResultRespDTO();
        respDto.setResultId(1L);
        respDto.setTotalMarks(175);

        when(resultService.uploadResult(any(ResultReqDTO.class))).thenReturn(respDto);

        mockMvc.perform(post("/api/results")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(reqDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.totalMarks", org.hamcrest.Matchers.is(175)));
    }

    @Test
    @WithMockUser(roles = "USER")
    void getResultsByStudent_returnsOk() throws Exception {
        when(resultService.getResultsByStudent(1L)).thenReturn(List.of(new ResultRespDTO()));

        mockMvc.perform(get("/api/results/student/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateResult_returnsOk() throws Exception {
        ResultReqDTO reqDto = new ResultReqDTO();
        reqDto.setStudentId(1L);
        reqDto.setSubjectId(1L);
        reqDto.setSemesterId(1L);
        reqDto.setTheoryMarks(95);
        reqDto.setPracticalMarks(95);

        ResultRespDTO respDto = new ResultRespDTO();
        respDto.setResultId(1L);
        respDto.setTotalMarks(190);

        when(resultService.updateResult(eq(1L), any(ResultReqDTO.class))).thenReturn(respDto);

        mockMvc.perform(put("/api/results/1")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(reqDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalMarks", org.hamcrest.Matchers.is(190)));
    }
}
