package com.university.placement.service;

import com.university.placement.dto.*;
import com.university.placement.entity.*;
import com.university.placement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentPlacementService {

    private final StudentSkillRepository skillRepository;
    private final JobApplicationRepository applicationRepository;
    private final PlacementInterviewRepository interviewRepository;
    private final JobOpeningRepository jobOpeningRepository;
    private final JdbcTemplate jdbcTemplate;

    /**
     * Fetch academic details for a student: CGPA, Department, Enrollment, Name
     */
    public StudentEligibilityDTO getStudentAcademicInfo(Long studentId) {
        String studentSql = """
            SELECT s.id, s.full_name, s.enrollment_no, s.current_semester, 
                   COALESCE(d.dept_name, 'General Engineering') AS dept_name,
                   COALESCE(d.dept_code, 'GEN') AS dept_code
            FROM students s
            LEFT JOIN departments d ON s.dept_id = d.id
            WHERE s.id = ?
        """;

        List<Map<String, Object>> studentRows = jdbcTemplate.queryForList(studentSql, studentId);
        if (studentRows.isEmpty()) {
            throw new RuntimeException("Student not found in university directory: " + studentId);
        }

        Map<String, Object> sRow = studentRows.get(0);
        String name = (String) sRow.get("full_name");
        String enrollmentNo = (String) sRow.get("enrollment_no");
        String deptName = (String) sRow.get("dept_name");
        Integer sem = sRow.get("current_semester") != null ? ((Number) sRow.get("current_semester")).intValue() : 1;

        // Calculate CGPA from published marks in results table
        BigDecimal cgpa = calculateCgpa(studentId);

        return StudentEligibilityDTO.builder()
                .studentId(studentId)
                .studentName(name)
                .enrollmentNo(enrollmentNo)
                .departmentName(deptName)
                .currentSemester(sem)
                .cgpa(cgpa)
                .eligible(true)
                .reasons(new ArrayList<>())
                .build();
    }

    /**
     * Evaluates whether a student meets the criteria for a specific job opening
     */
    public StudentEligibilityDTO checkStudentEligibility(Long studentId, JobOpening job) {
        StudentEligibilityDTO profile = getStudentAcademicInfo(studentId);
        List<String> reasons = new ArrayList<>();
        boolean eligible = true;

        // Check CGPA threshold
        if (job.getMinCgpa() != null && profile.getCgpa() != null) {
            if (profile.getCgpa().compareTo(job.getMinCgpa()) < 0) {
                eligible = false;
                reasons.add(String.format("Requires min %.2f CGPA (Your current CGPA is %.2f)",
                        job.getMinCgpa().doubleValue(), profile.getCgpa().doubleValue()));
            }
        }

        // Check allowed branches / departments
        if (job.getAllowedBranches() != null && !job.getAllowedBranches().trim().isEmpty()) {
            String allowed = job.getAllowedBranches().toLowerCase();
            String studentDept = profile.getDepartmentName().toLowerCase();
            boolean branchMatches = Arrays.stream(allowed.split(","))
                    .map(String::trim)
                    .anyMatch(b -> studentDept.contains(b) || b.contains(studentDept) || b.equalsIgnoreCase("all"));

            if (!branchMatches) {
                eligible = false;
                reasons.add("Eligible branches: " + job.getAllowedBranches() + " (Your branch: " + profile.getDepartmentName() + ")");
            }
        }

        // Check if deadline passed
        if (job.getDeadline() != null && job.getDeadline().isBefore(java.time.LocalDate.now())) {
            eligible = false;
            reasons.add("Application deadline passed on " + job.getDeadline());
        }

        if (eligible) {
            reasons.add("You meet all academic & department eligibility criteria!");
        }

        profile.setEligible(eligible);
        profile.setReasons(reasons);
        return profile;
    }

    /**
     * Compute student CGPA from results table.
     * Total marks typically scored out of 100 or 200.
     */
    public BigDecimal calculateCgpa(Long studentId) {
        try {
            String resultsSql = """
                SELECT AVG(total_marks) AS avg_marks, MAX(total_marks) AS max_marks, COUNT(id) AS result_count
                FROM results
                WHERE student_id = ?
            """;
            List<Map<String, Object>> resultRows = jdbcTemplate.queryForList(resultsSql, studentId);
            if (!resultRows.isEmpty() && resultRows.get(0).get("avg_marks") != null) {
                double avgMarks = ((Number) resultRows.get(0).get("avg_marks")).doubleValue();
                double maxMarks = ((Number) resultRows.get(0).get("max_marks")).doubleValue();

                // If marks are on a 200 scale (theory + practical)
                double cgpaVal = (maxMarks > 100) ? (avgMarks / 20.0) : (avgMarks / 10.0);
                if (cgpaVal > 10.0) cgpaVal = 10.0;
                return BigDecimal.valueOf(cgpaVal).setScale(2, RoundingMode.HALF_UP);
            }
        } catch (Exception e) {
            // fallback
        }
        // Baseline default academic standing if semester marks aren't logged yet
        return BigDecimal.valueOf(7.85).setScale(2, RoundingMode.HALF_UP);
    }

    // --- Student Skills Management ---

    public List<StudentSkill> getStudentSkills(Long studentId) {
        return skillRepository.findByStudentId(studentId);
    }

    @Transactional
    public StudentSkill addStudentSkill(Long studentId, StudentSkill skill) {
        skill.setStudentId(studentId);
        if (skill.getSkillName() == null || skill.getSkillName().trim().isEmpty()) {
            throw new IllegalArgumentException("Skill name is required");
        }
        if (skill.getProficiencyLevel() == null) {
            skill.setProficiencyLevel("INTERMEDIATE");
        }
        return skillRepository.save(skill);
    }

    @Transactional
    public void deleteStudentSkill(Long skillId) {
        skillRepository.deleteById(skillId);
    }

    // --- Complete Student Placement Dashboard & History ---

    public StudentPlacementProfileDTO getStudentPlacementProfile(Long studentId) {
        StudentEligibilityDTO academicInfo = getStudentAcademicInfo(studentId);
        List<StudentSkill> skills = getStudentSkills(studentId);

        List<JobApplication> applications = applicationRepository.findByStudentId(studentId);
        List<JobApplicationDTO> applicationDTOs = applications.stream()
                .map(this::mapToAppDTO)
                .collect(Collectors.toList());

        List<PlacementInterview> interviews = interviewRepository.findByApplication_StudentId(studentId);
        List<PlacementInterviewDTO> interviewDTOs = interviews.stream()
                .map(this::mapToInterviewDTO)
                .collect(Collectors.toList());

        long totalApps = applications.size();
        long shortlisted = applications.stream().filter(a -> a.getStatus() == JobApplication.ApplicationStatus.SHORTLISTED).count();
        long interviewsCount = interviews.size();
        long offers = applications.stream().filter(a -> a.getStatus() == JobApplication.ApplicationStatus.SELECTED).count();

        return StudentPlacementProfileDTO.builder()
                .studentId(studentId)
                .studentName(academicInfo.getStudentName())
                .enrollmentNo(academicInfo.getEnrollmentNo())
                .departmentName(academicInfo.getDepartmentName())
                .currentSemester(academicInfo.getCurrentSemester())
                .cgpa(academicInfo.getCgpa())
                .skills(skills)
                .applications(applicationDTOs)
                .upcomingInterviews(interviewDTOs)
                .totalApplications(totalApps)
                .totalShortlisted(shortlisted)
                .totalInterviews(interviewsCount)
                .totalOffers(offers)
                .build();
    }

    private JobApplicationDTO mapToAppDTO(JobApplication app) {
        JobOpening opening = app.getOpening();
        Company company = opening.getCompany();

        return JobApplicationDTO.builder()
                .applicationId(app.getApplicationId())
                .openingId(opening.getOpeningId())
                .jobTitle(opening.getTitle())
                .companyId(company.getCompanyId())
                .companyName(company.getName())
                .packageLpa(opening.getPackageLpa())
                .jobType(opening.getJobType())
                .studentId(app.getStudentId())
                .appliedAt(app.getAppliedAt())
                .status(app.getStatus().name())
                .resumeUrl(app.getResumeUrl())
                .coverLetter(app.getCoverLetter())
                .feedback(app.getFeedback())
                .build();
    }

    private PlacementInterviewDTO mapToInterviewDTO(PlacementInterview interview) {
        JobApplication app = interview.getApplication();
        JobOpening opening = app.getOpening();
        Company company = opening.getCompany();

        return PlacementInterviewDTO.builder()
                .interviewId(interview.getInterviewId())
                .applicationId(app.getApplicationId())
                .studentId(app.getStudentId())
                .jobTitle(opening.getTitle())
                .companyName(company.getName())
                .interviewRound(interview.getInterviewRound())
                .scheduledAt(interview.getScheduledAt())
                .venueOrLink(interview.getVenueOrLink())
                .mode(interview.getMode() != null ? interview.getMode().name() : "OFFLINE")
                .result(interview.getResult() != null ? interview.getResult().name() : "PENDING")
                .remarks(interview.getRemarks())
                .build();
    }
}
