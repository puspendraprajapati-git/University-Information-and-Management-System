package com.university.exam.repository;

import com.university.exam.entity.ExamRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExamRoomRepository extends JpaRepository<ExamRoom, Long> {
    Optional<ExamRoom> findByRoomName(String roomName);
}
