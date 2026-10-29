package com.university.exam.repository;

import com.university.exam.entity.StudentExamRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentExamRegistrationRepository extends JpaRepository<StudentExamRegistration, Long> {
    List<StudentExamRegistration> findByStudentId(Long studentId);
    List<StudentExamRegistration> findByExamId(Long examId);
    Optional<StudentExamRegistration> findByExamIdAndStudentId(Long examId, Long studentId);
    long countByExamId(Long examId);
}
