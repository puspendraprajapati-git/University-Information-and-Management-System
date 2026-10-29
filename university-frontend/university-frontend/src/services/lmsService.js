import axios from 'axios';

const lmsAxios = axios.create({
  baseURL: process.env.REACT_APP_LMS_URL || '/lms',
});

// Interceptor to attach Bearer token automatically
lmsAxios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Assignments
export const getAllAssignments = () => lmsAxios.get('/assignments');

export const getAssignmentsBySubject = (subjectId) =>
  lmsAxios.get(`/assignments/subject/${subjectId}`);

export const getAssignmentsByFaculty = (facultyId) =>
  lmsAxios.get(`/assignments/faculty/${facultyId}`);

export const getAssignmentById = (id) => lmsAxios.get(`/assignments/${id}`);

export const createAssignment = (data) => lmsAxios.post('/assignments', data);

export const deleteAssignment = (id) => lmsAxios.delete(`/assignments/${id}`);

// Submissions
export const submitAssignment = (formData) =>
  lmsAxios.post('/submissions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getSubmissionsByAssignment = (assignmentId) =>
  lmsAxios.get(`/submissions/assignment/${assignmentId}`);

export const getSubmissionsByStudent = (studentId) =>
  lmsAxios.get(`/submissions/student/${studentId}`);

export const getSubmissionById = (submissionId) =>
  lmsAxios.get(`/submissions/${submissionId}`);

// Evaluations
export const evaluateSubmission = (data) => lmsAxios.post('/evaluations', data);

export const getEvaluationBySubmissionId = (submissionId) =>
  lmsAxios.get(`/evaluations/submission/${submissionId}`);

// Learning Resources
export const getAllResources = () => lmsAxios.get('/resources');

export const getResourcesBySubject = (subjectId) =>
  lmsAxios.get(`/resources/subject/${subjectId}`);

export const uploadResource = (formData) =>
  lmsAxios.post('/resources', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteResource = (id) => lmsAxios.delete(`/resources/${id}`);

export default lmsAxios;
