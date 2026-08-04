package com.university.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.university.dto.AttendanceReqDTO;
import com.university.dto.AttendanceRespDTO;
import com.university.enums.AttendanceStatus;
import com.university.service.AttendanceService;
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
class AttendanceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AttendanceService attendanceService;

    @Test
    @WithMockUser(roles = "FACULTY")
    void markAttendance_returns201() throws Exception {
        AttendanceReqDTO reqDto = new AttendanceReqDTO();
        reqDto.setStudentId(1L);
        reqDto.setSubjectId(1L);
        reqDto.setFacultyId(1L);
        reqDto.setSemesterId(1L);
        reqDto.setAttendanceDate(LocalDate.now());
        reqDto.setStatus(AttendanceStatus.PRESENT);

        AttendanceRespDTO respDto = new AttendanceRespDTO();
        respDto.setAttendanceId(1L);
        respDto.setStatus(AttendanceStatus.PRESENT);

        when(attendanceService.markAttendance(any(AttendanceReqDTO.class))).thenReturn(respDto);

        mockMvc.perform(post("/api/attendance")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(reqDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", org.hamcrest.Matchers.is("PRESENT")));
    }

    @Test
    @WithMockUser(roles = "USER")
    void getAttendanceByStudent_returnsOk() throws Exception {
        when(attendanceService.getAttendanceByStudent(1L)).thenReturn(List.of(new AttendanceRespDTO()));

        mockMvc.perform(get("/api/attendance/student/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateAttendance_returnsOk() throws Exception {
        AttendanceReqDTO reqDto = new AttendanceReqDTO();
        reqDto.setStudentId(1L);
        reqDto.setSubjectId(1L);
        reqDto.setFacultyId(1L);
        reqDto.setSemesterId(1L);
        reqDto.setAttendanceDate(LocalDate.now());
        reqDto.setStatus(AttendanceStatus.ABSENT);

        AttendanceRespDTO respDto = new AttendanceRespDTO();
        respDto.setAttendanceId(1L);
        respDto.setStatus(AttendanceStatus.ABSENT);

        when(attendanceService.updateAttendance(eq(1L), any(AttendanceReqDTO.class))).thenReturn(respDto);

        mockMvc.perform(put("/api/attendance/1")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(reqDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", org.hamcrest.Matchers.is("ABSENT")));
    }
}
