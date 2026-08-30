package com.university.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentRespDTO {

    private Long studentId;
    private String enrollmentNo;
    private String fullName;
    private Long deptId;
    private String deptName;
    private Long currentSemesterId;
    private LocalDate dateOfBirth;
    private String username;
    private String email;
}