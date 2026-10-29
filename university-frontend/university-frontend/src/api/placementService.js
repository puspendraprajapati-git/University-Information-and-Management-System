import axios from 'axios';

const placementAxios = axios.create({
  baseURL: process.env.REACT_APP_PLACEMENT_URL || '/placement',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

const attachToken = (config) => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

placementAxios.interceptors.request.use(attachToken);

export const placementService = {
  // Health
  checkHealth: () => placementAxios.get('/health'),

  // Companies
  getAllCompanies: () => placementAxios.get('/companies'),
  getCompanyById: (id) => placementAxios.get(`/companies/${id}`),
  createCompany: (data) => placementAxios.post('/companies', data),
  updateCompany: (id, data) => placementAxios.put(`/companies/${id}`, data),
  deleteCompany: (id) => placementAxios.delete(`/companies/${id}`),

  // Job Openings
  getAllJobs: (studentId = null, activeOnly = false) => {
    const params = new URLSearchParams();
    if (studentId) params.append('studentId', studentId);
    if (activeOnly) params.append('activeOnly', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    return placementAxios.get(`/jobs${query}`);
  },
  getJobById: (id, studentId = null) => {
    const query = studentId ? `?studentId=${studentId}` : '';
    return placementAxios.get(`/jobs/${id}${query}`);
  },
  createJob: (data) => placementAxios.post('/jobs', data),
  updateJob: (id, data) => placementAxios.put(`/jobs/${id}`, data),
  deleteJob: (id) => placementAxios.delete(`/jobs/${id}`),
  getEligibleStudents: (id) => placementAxios.get(`/jobs/${id}/eligible-students`),

  // Job Applications
  applyForJob: (data) => placementAxios.post('/applications', data),
  getApplicationsForJob: (openingId) => placementAxios.get(`/applications/opening/${openingId}`),
  getApplicationsForStudent: (studentId) => placementAxios.get(`/applications/student/${studentId}`),
  getApplicationById: (id) => placementAxios.get(`/applications/${id}`),
  updateApplicationStatus: (id, status, feedback = '') =>
    placementAxios.patch(`/applications/${id}/status`, { status, feedback }),

  // Placement Drives
  getAllDrives: () => placementAxios.get('/drives'),
  getUpcomingDrives: () => placementAxios.get('/drives/upcoming'),
  scheduleDrive: (data) => placementAxios.post('/drives', data),
  updateDrive: (id, data) => placementAxios.put(`/drives/${id}`, data),
  deleteDrive: (id) => placementAxios.delete(`/drives/${id}`),

  // Interviews
  scheduleInterview: (data) => placementAxios.post('/interviews', data),
  updateInterviewResult: (id, result, remarks = '') =>
    placementAxios.patch(`/interviews/${id}/result`, { result, remarks }),
  getStudentInterviews: (studentId) => placementAxios.get(`/interviews/student/${studentId}`),
  getInterviewsForApplication: (applicationId) => placementAxios.get(`/interviews/application/${applicationId}`),
  deleteInterview: (id) => placementAxios.delete(`/interviews/${id}`),

  // Student Profile & Skills
  getStudentProfile: (studentId) => placementAxios.get(`/student/${studentId}/profile`),
  getStudentAcademic: (studentId) => placementAxios.get(`/student/${studentId}/academic`),
  getStudentSkills: (studentId) => placementAxios.get(`/student/${studentId}/skills`),
  addStudentSkill: (studentId, skill) => placementAxios.post(`/student/${studentId}/skills`, skill),
  deleteStudentSkill: (skillId) => placementAxios.delete(`/student/skills/${skillId}`),
};

export default placementService;
