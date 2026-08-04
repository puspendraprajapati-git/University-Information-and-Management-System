package com.university.repository;

import com.university.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudent_Id(Long studentId);
    List<Attendance> findBySubject_IdAndSemester_Id(Long subjectId, Long semesterId);
}