package com.university.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FacultyRespDTO {

    private Long facultyId;
    private String fullName;
    private Long deptId;
    private String deptName;
    private String qualification;
    private String username;
    private String email;
}