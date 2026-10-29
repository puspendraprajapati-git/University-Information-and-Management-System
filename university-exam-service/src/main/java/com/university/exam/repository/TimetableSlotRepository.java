package com.university.exam.repository;

import com.university.exam.entity.TimetableSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;

@Repository
public interface TimetableSlotRepository extends JpaRepository<TimetableSlot, Long> {

    List<TimetableSlot> findBySemesterId(Long semesterId);
    List<TimetableSlot> findByFacultyId(Long facultyId);
    List<TimetableSlot> findByRoomId(Long roomId);

    @Query("""
        SELECT COUNT(t) FROM TimetableSlot t
        WHERE t.roomId = :roomId
          AND t.dayOfWeek = :dayOfWeek
          AND (:startTime < t.endTime AND :endTime > t.startTime)
          AND (:slotId IS NULL OR t.slotId != :slotId)
    """)
    long countOverlappingRoomSlots(
        @Param("roomId") Long roomId,
        @Param("dayOfWeek") String dayOfWeek,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("slotId") Long slotId
    );

    @Query("""
        SELECT COUNT(t) FROM TimetableSlot t
        WHERE t.facultyId = :facultyId
          AND t.dayOfWeek = :dayOfWeek
          AND (:startTime < t.endTime AND :endTime > t.startTime)
          AND (:slotId IS NULL OR t.slotId != :slotId)
    """)
    long countOverlappingFacultySlots(
        @Param("facultyId") Long facultyId,
        @Param("dayOfWeek") String dayOfWeek,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("slotId") Long slotId
    );
}
