package com.university.repository;

import com.university.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Student findByEnrollmentNo(String enrollmentNo);
    List<Student> findByDepartment_DeptId(Long deptId);
    List<Student> findByCurrentSemester(Integer semester);
}