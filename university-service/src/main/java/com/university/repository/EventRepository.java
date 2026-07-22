package com.university.repository;

import com.university.entity.Event;
import com.university.enums.EventType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByType(EventType type);
}