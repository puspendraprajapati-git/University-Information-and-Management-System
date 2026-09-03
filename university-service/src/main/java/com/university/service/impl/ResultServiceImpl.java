package com.university.service.impl;

import com.university.dto.ResultReqDTO;
import com.university.dto.ResultRespDTO;
import com.university.dto.SemesterResultRespDTO;
import com.university.entity.Result;
import com.university.entity.Semester;
import com.university.entity.Student;
import com.university.entity.Subject;
import com.university.exception.ResourceNotFoundException;
import com.university.repository.ResultRepository;
import com.university.repository.SemesterRepository;
import com.university.repository.StudentRepository;
import com.university.repository.SubjectRepository;
import com.university.service.ResultService;
import com.university.util.GradeUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResultServiceImpl implements ResultService {

    private final ResultRepository resultRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final SemesterRepository semesterRepository;

    /*
     * Method to upload a new result
     */
    @Override
    @Transactional
    public ResultRespDTO uploadResult(ResultReqDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + dto.getStudentId()));

        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + dto.getSubjectId()));

        Semester semester = semesterRepository.findById(dto.getSemesterId())
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with id: " + dto.getSemesterId()));

        int theory = dto.getTheoryMarks() != null ? dto.getTheoryMarks() : 0;
        int practical = dto.getPracticalMarks() != null ? dto.getPracticalMarks() : 0;
        int total = theory + practical;
        String grade = GradeUtil.calculateGrade(total);

        Result result = Result.builder()
                .student(student)
                .subject(subject)
                .semester(semester)
                .theoryMarks(dto.getTheoryMarks())
                .practicalMarks(dto.getPracticalMarks())
                .totalMarks(total)
                .grade(grade)
                .resultDate(LocalDate.now())
                .build();

        Result saved = resultRepository.save(result);
        return mapToResponse(saved);
    }

    /*
     * Method to update an existing result
     */
    @Override
    @Transactional
    public ResultRespDTO updateResult(Long id, ResultReqDTO dto) {
        Result existing = resultRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Result not found with id: " + id));

        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + dto.getStudentId()));

        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + dto.getSubjectId()));

        Semester semester = semesterRepository.findById(dto.getSemesterId())
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with id: " + dto.getSemesterId()));

        int theory = dto.getTheoryMarks() != null ? dto.getTheoryMarks() : 0;
        int practical = dto.getPracticalMarks() != null ? dto.getPracticalMarks() : 0;
        int total = theory + practical;
        String grade = GradeUtil.calculateGrade(total);

        existing.setStudent(student);
        existing.setSubject(subject);
        existing.setSemester(semester);
        existing.setTheoryMarks(dto.getTheoryMarks());
        existing.setPracticalMarks(dto.getPracticalMarks());
        existing.setTotalMarks(total);
        existing.setGrade(grade);
        existing.setResultDate(LocalDate.now());

        Result updated = resultRepository.save(existing);
        return mapToResponse(updated);
    }

    /*
     * Method to get a result by ID
     */
    @Override
    @Transactional(readOnly = true)
    public ResultRespDTO getResultById(Long id) {
        Result result = resultRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Result not found with id: " + id));
        return mapToResponse(result);
    }

    /*
     * Method to get all results
     */
    @Override
    @Transactional(readOnly = true)
    public List<ResultRespDTO> getAllResults() {
        return resultRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /*
     * Method to get results by student ID
     */
    @Override
    @Transactional(readOnly = true)
    public List<ResultRespDTO> getResultsByStudent(Long studentId) {
        return resultRepository.findByStudent_Id(studentId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /*
     * Method to get semester result for a student
     */
    @Override
    @Transactional(readOnly = true)
    public SemesterResultRespDTO getSemesterResult(Long studentId, Long semesterId) {
        List<Result> results = resultRepository.findByStudent_IdAndSemester_Id(studentId, semesterId);

        if (results.isEmpty()) {
            throw new ResourceNotFoundException("No results found for this student in the given semester");
        }

        List<ResultRespDTO> subjectResults = results.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        double gpa = results.stream()
                .mapToDouble(r -> GradeUtil.gradeToPoint(r.getGrade()))
                .average()
                .orElse(0.0);

        Student student = results.get(0).getStudent();
        Semester semester = results.get(0).getSemester();

        return new SemesterResultRespDTO(
                student.getId(),
                student.getFullName(),
                semester.getId(),
                semester.getSemesterName(),
                subjectResults,
                Math.round(gpa * 100.0) / 100.0 // round to 2 decimal places
        );
    }

    /*
     * Method to delete a result
     */
    @Override
    public void deleteResult(Long id) {
        if (!resultRepository.existsById(id)) {
            throw new ResourceNotFoundException("Result not found with id: " + id);
        }
        resultRepository.deleteById(id);
    }

    /*
     * Helper method to map entity to DTO
     */
    private ResultRespDTO mapToResponse(Result result) {
        return new ResultRespDTO(
                result.getId(),
                result.getStudent().getId(),
                result.getStudent().getFullName(),
                result.getSubject().getId(),
                result.getSubject().getSubjectName(),
                result.getSemester().getId(),
                result.getSemester().getSemesterName(),
                result.getTheoryMarks(),
                result.getPracticalMarks(),
                result.getTotalMarks(),
                result.getGrade(),
                result.getResultDate()
        );
    }
}