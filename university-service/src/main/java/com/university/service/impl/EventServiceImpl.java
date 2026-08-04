package com.university.service.impl;

import com.university.dto.EventReqDTO;
import com.university.dto.EventRespDTO;
import com.university.entity.Event;
import com.university.entity.Faculty;
import com.university.enums.EventType;
import com.university.exception.ResourceNotFoundException;
import com.university.repository.EventRepository;
import com.university.repository.FacultyRepository;
import com.university.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final FacultyRepository facultyRepository;

    /*
     * Method to create a new event
     */
    @Override
    @Transactional
    public EventRespDTO createEvent(EventReqDTO dto) {
        Faculty organizer = facultyRepository.findById(dto.getOrganizerId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty (organizer) not found with id: " + dto.getOrganizerId()));

        Event event = Event.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .eventDate(dto.getEventDate())
                .venue(dto.getVenue())
                .organizer(organizer)
                .type(dto.getType())
                .filePath(dto.getFilePath())
                .build();

        Event saved = eventRepository.save(event);
        return mapToResponse(saved);
    }

    /*
     * Method to update an existing event
     */
    @Override
    @Transactional
    public EventRespDTO updateEvent(Long id, EventReqDTO dto) {
        Event existing = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        Faculty organizer = facultyRepository.findById(dto.getOrganizerId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty (organizer) not found with id: " + dto.getOrganizerId()));

        existing.setTitle(dto.getTitle());
        existing.setDescription(dto.getDescription());
        existing.setEventDate(dto.getEventDate());
        existing.setVenue(dto.getVenue());
        existing.setOrganizer(organizer);
        existing.setType(dto.getType());
        existing.setFilePath(dto.getFilePath());

        Event updated = eventRepository.save(existing);
        return mapToResponse(updated);
    }

    /*
     * Method to get event by ID
     */
    @Override
    public EventRespDTO getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        return mapToResponse(event);
    }

    /*
     * Method to get all events
     */
    @Override
    public List<EventRespDTO> getAllEvents() {
        return eventRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /*
     * Method to get events by type
     */
    @Override
    public List<EventRespDTO> getEventsByType(EventType type) {
        return eventRepository.findByType(type)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /*
     * Method to delete an event
     */
    @Override
    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new ResourceNotFoundException("Event not found with id: " + id);
        }
        eventRepository.deleteById(id);
    }

    /*
     * Helper method to map entity to response
     */
    private EventRespDTO mapToResponse(Event event) {
        return new EventRespDTO(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getEventDate(),
                event.getVenue(),
                event.getOrganizer().getId(),
                event.getOrganizer().getFullName(),
                event.getType(),
                event.getFilePath()
        );
    }
}