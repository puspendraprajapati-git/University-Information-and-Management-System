package com.university.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.university.dto.EventReqDTO;
import com.university.dto.EventRespDTO;
import com.university.enums.EventType;
import com.university.service.EventService;
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
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EventService eventService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void createEvent_returns201() throws Exception {
        EventReqDTO reqDto = new EventReqDTO();
        reqDto.setTitle("Annual Day");
        reqDto.setEventDate(LocalDate.of(2026, 12, 1));
        reqDto.setOrganizerId(1L);
        reqDto.setType(EventType.EVENT);

        EventRespDTO respDto = new EventRespDTO();
        respDto.setEventId(1L);
        respDto.setTitle("Annual Day");
        respDto.setType(EventType.EVENT);

        when(eventService.createEvent(any(EventReqDTO.class))).thenReturn(respDto);

        mockMvc.perform(post("/api/events")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(reqDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", org.hamcrest.Matchers.is("Annual Day")));
    }

    @Test
    @WithMockUser(roles = "USER")
    void getAllEvents_returnsOk() throws Exception {
        when(eventService.getAllEvents()).thenReturn(List.of(new EventRespDTO()));

        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateEvent_returnsOk() throws Exception {
        EventReqDTO reqDto = new EventReqDTO();
        reqDto.setTitle("Annual Day Updated");
        reqDto.setOrganizerId(1L);
        reqDto.setType(EventType.EVENT);

        EventRespDTO respDto = new EventRespDTO();
        respDto.setEventId(1L);
        respDto.setTitle("Annual Day Updated");

        when(eventService.updateEvent(eq(1L), any(EventReqDTO.class))).thenReturn(respDto);

        mockMvc.perform(put("/api/events/1")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(reqDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", org.hamcrest.Matchers.is("Annual Day Updated")));
    }

    @Test
    @WithMockUser(roles = "USER")
    void getEventsByType_returnsOk() throws Exception {
        EventRespDTO respDto = new EventRespDTO();
        respDto.setType(EventType.NEWS);
        when(eventService.getEventsByType(EventType.NEWS)).thenReturn(List.of(respDto));

        mockMvc.perform(get("/api/events/type/NEWS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type", org.hamcrest.Matchers.is("NEWS")));
    }
}
