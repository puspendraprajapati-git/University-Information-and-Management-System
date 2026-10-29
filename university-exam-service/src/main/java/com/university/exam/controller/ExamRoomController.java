package com.university.exam.controller;

import com.university.exam.entity.ExamRoom;
import com.university.exam.service.ExamRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/exam-rooms", "/api/exam-rooms"})
@RequiredArgsConstructor
public class ExamRoomController {

    private final ExamRoomService roomService;

    @GetMapping
    public ResponseEntity<List<ExamRoom>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExamRoom> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @PostMapping
    public ResponseEntity<ExamRoom> createRoom(@RequestBody ExamRoom room) {
        return ResponseEntity.status(201).body(roomService.createRoom(room));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
}
