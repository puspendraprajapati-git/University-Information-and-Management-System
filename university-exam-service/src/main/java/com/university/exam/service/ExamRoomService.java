package com.university.exam.service;

import com.university.exam.entity.ExamRoom;
import com.university.exam.repository.ExamRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamRoomService {

    private final ExamRoomRepository roomRepository;

    public List<ExamRoom> getAllRooms() {
        return roomRepository.findAll();
    }

    public ExamRoom getRoomById(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Exam room not found with ID: " + roomId));
    }

    public ExamRoom createRoom(ExamRoom room) {
        return roomRepository.save(room);
    }

    public void deleteRoom(Long roomId) {
        roomRepository.deleteById(roomId);
    }
}
