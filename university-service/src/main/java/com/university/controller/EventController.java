package com.university.controller;

import io.swagger.v3.oas.annotations.Operation;
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

    // dependency - constructor based D.I
    private final EventService eventService;

    /*
     * URI - /api/events
     * Method - POST
     * I/P - event req dto (Admin/Faculty publishes event)
     * Success resp - api resp + SC 201
     * Error resp - SC 400
     */
    @PostMapping
    @Operation(description = "Create event")
    public ResponseEntity<?> createEvent(@Valid @RequestBody EventReqDTO dto) {
        System.out.println("in create event " + dto);
        return new ResponseEntity<>(eventService.createEvent(dto), HttpStatus.CREATED);
    }

    /*
     * URI - /api/events/{id}
     * Method - PUT
     * I/P - id : path var, event req dto
     * Success resp - SC 200 + event resp dto
     * Error resp - SC 404
     */
    @PutMapping("/{id}")
    @Operation(description = "Update event")
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @Valid @RequestBody EventReqDTO dto) {
        System.out.println("in update event " + id);
        return ResponseEntity.ok(eventService.updateEvent(id, dto));
    }

    /*
     * URI - /api/events/{id}
     * Method - GET
     * I/P - id : path var
     * Success resp - SC 200 , + event resp dto
     * Error resp - SC 404
     */
    @GetMapping("/{id}")
    @Operation(description = "Get event by id")
    public ResponseEntity<?> getEventById(@PathVariable Long id) {
        System.out.println("in get event " + id);
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    /*
     * URI - /api/events
     * Method - GET
     * resp - SC 200 + List<dto>
     */
    @GetMapping
    @Operation(description = "Get all events")
    public ResponseEntity<?> getAllEvents() {
        System.out.println("in get all events");
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    /*
     * URI - /api/events/type/{type}
     * Method - GET
     * I/P - type : path var (Student views by type: NEWS, EVENT, SYLLABUS)
     * Success resp - SC 200 , + List<dto>
     */
    @GetMapping("/type/{type}")
    @Operation(description = "Get events by type")
    public ResponseEntity<?> getEventsByType(@PathVariable EventType type) {
        System.out.println("in get events by type " + type);
        return ResponseEntity.ok(eventService.getEventsByType(type));
    }

    /*
     * URI - /api/events/{id}
     * Method - DELETE
     * I/P - id : path var
     * Success resp - SC 200
     * Error resp - SC 404
     */
    @DeleteMapping("/{id}")
    @Operation(description = "Delete event")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        System.out.println("in delete event " + id);
        eventService.deleteEvent(id);
        return ResponseEntity.ok("Event deleted successfully");
    }
}