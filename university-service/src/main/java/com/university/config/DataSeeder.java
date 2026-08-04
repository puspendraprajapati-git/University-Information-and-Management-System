package com.university.config;

import com.university.entity.*;
import com.university.enums.Role;
import com.university.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UsersRepository usersRepository;
    private final DepartmentRepository departmentRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final SemesterRepository semesterRepository;
    private final SubjectRepository subjectRepository;

    @Override
    public void run(String... args) throws Exception {
        // Create Department if not exists
        Department dept = departmentRepository.findByDeptCode("CS");
        if (dept == null) {
            dept = Department.builder().deptName("Computer Science").deptCode("CS").build();
            dept = departmentRepository.save(dept);
        }

        Semester sem = semesterRepository.findById(1L).orElse(null);
        if (sem == null) {
            sem = Semester.builder().semesterName("Semester 1").startDate(LocalDate.now()).endDate(LocalDate.now().plusMonths(6)).build();
            sem = semesterRepository.save(sem);
        }

        List<Subject> subjects = subjectRepository.findAll();
        Subject sub;
        if (subjects.isEmpty()) {
            sub = Subject.builder().subjectName("Intro to CS").subjectCode("CS101").credits(4).department(dept).semester(sem).build();
            sub = subjectRepository.save(sub);
        }

        // Ensure all STUDENT users have a profile
        List<Users> students = usersRepository.findAll().stream().filter(u -> u.getRole() == Role.STUDENT).toList();
        for (Users u : students) {
            if (!studentRepository.existsById(u.getId())) {
                Student s = Student.builder()
                        .user(u)
                        .enrollmentNo("EN" + u.getId())
                        .fullName(u.getUsername() != null ? u.getUsername() : "Student " + u.getId())
                        .department(dept)
                        .currentSemester(1)
                        .dateOfBirth(LocalDate.of(2000, 1, 1))
                        .build();
                try {
                    studentRepository.save(s);
                } catch (Exception e) {
                    System.out.println("Failed to seed student for user " + u.getId() + " - likely already exists");
                }
            }
        }

        // Ensure all FACULTY users have a profile
        List<Users> faculties = usersRepository.findAll().stream().filter(u -> u.getRole() == Role.FACULTY).toList();
        for (Users u : faculties) {
            if (!facultyRepository.existsById(u.getId())) {
                Faculty f = Faculty.builder()
                        .user(u)
                        .fullName(u.getUsername() != null ? u.getUsername() : "Faculty " + u.getId())
                        .department(dept)
                        .qualification("PhD")
                        .build();
                try {
                    facultyRepository.save(f);
                } catch (Exception e) {
                    System.out.println("Failed to seed faculty for user " + u.getId() + " - likely already exists");
                }
            }
        }
    }
}
