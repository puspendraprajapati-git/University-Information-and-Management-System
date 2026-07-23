package com.university.controller;

import com.university.dto.EventReqDTO;
import com.university.dto.EventRespDTO;
import com.university.enums.EventType;
import com.university.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    // Admin/Faculty publishes event/news/syllabus
    @PostMapping
    public ResponseEntity<EventRespDTO> createEvent(@Valid @RequestBody EventReqDTO dto) {
        return new ResponseEntity<>(eventService.createEvent(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventRespDTO> updateEvent(@PathVariable Long id, @Valid @RequestBody EventReqDTO dto) {
        return ResponseEntity.ok(eventService.updateEvent(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventRespDTO> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @GetMapping
    public ResponseEntity<List<EventRespDTO>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    // Student views by type: /api/events/type/NEWS, /EVENT, /SYLLABUS
    @GetMapping("/type/{type}")
    public ResponseEntity<List<EventRespDTO>> getEventsByType(@PathVariable EventType type) {
        return ResponseEntity.ok(eventService.getEventsByType(type));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok("Event deleted successfully");
    }
}