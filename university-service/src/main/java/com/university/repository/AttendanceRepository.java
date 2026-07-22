package com.university.repository;

import com.university.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudent_StudentId(Long studentId);
    List<Attendance> findBySubject_SubjectIdAndSemester_SemesterId(Long subjectId, Long semesterId);
}