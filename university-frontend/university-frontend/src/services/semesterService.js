import axiosInstance from '../api/axiosInstance';


// Fetch all semesters records
export const getAllSemesters = () => axiosInstance.get('/semesters');

// Fetch a specific semesterbyid by ID
export const getSemesterById = (id) => axiosInstance.get(`/semesters/${id}`);

// Create a new semester record
export const createSemester = (data) => axiosInstance.post('/semesters', data);

// Update an existing semester record
export const updateSemester = (id, data) => axiosInstance.put(`/semesters/${id}`, data);

// Delete a semester record
export const deleteSemester = (id) => axiosInstance.delete(`/semesters/${id}`);
