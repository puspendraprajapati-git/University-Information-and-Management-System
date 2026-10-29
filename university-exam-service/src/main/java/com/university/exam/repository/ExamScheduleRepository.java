package com.university.exam.repository;

import com.university.exam.entity.ExamSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExamScheduleRepository extends JpaRepository<ExamSchedule, Long> {

    List<ExamSchedule> findByExamId(Long examId);
    List<ExamSchedule> findByRoomId(Long roomId);

    /**
     * Checks if a room is already occupied during the requested exam date and time window.
     */
    @Query("""
        SELECT COUNT(s) FROM ExamSchedule s
        JOIN Exam e ON s.examId = e.examId
        WHERE s.roomId = :roomId
          AND e.examDate = :examDate
          AND (:startTime < s.endTime AND :endTime > s.startTime)
          AND (:scheduleId IS NULL OR s.scheduleId != :scheduleId)
    """)
    long countOverlappingExamRoomSchedules(
        @Param("roomId") Long roomId,
        @Param("examDate") LocalDate examDate,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("scheduleId") Long scheduleId
    );
}
