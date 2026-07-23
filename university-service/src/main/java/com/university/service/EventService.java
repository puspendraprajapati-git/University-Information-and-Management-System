package com.university.service;

import com.university.dto.EventReqDTO;
import com.university.dto.EventRespDTO;
import com.university.enums.EventType;
import java.util.List;

public interface EventService {
    EventRespDTO createEvent(EventReqDTO dto);
    EventRespDTO updateEvent(Long id, EventReqDTO dto);
    EventRespDTO getEventById(Long id);
    List<EventRespDTO> getAllEvents();
    List<EventRespDTO> getEventsByType(EventType type);
    void deleteEvent(Long id);
}