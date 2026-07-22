package com.university.repository;

import com.university.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findBySemester_SemesterId(Long semesterId);
    List<Subject> findByDepartment_DeptId(Long deptId);
}