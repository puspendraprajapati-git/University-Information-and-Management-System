package com.university.repository;

import com.university.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    List<Faculty> findByDepartment_Id(Long deptId);
    java.util.Optional<Faculty> findByUserId(Long userId);
}