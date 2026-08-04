import axiosInstance from '../api/axiosInstance';


// Fetch all results records
export const getAllResults = () => axiosInstance.get('/results');

// Fetch a specific resultsbystudent by ID
export const getResultsByStudent = (studentId) => axiosInstance.get(`/results/student/${studentId}`);

// Fetch a specific semesterresult by ID
export const getSemesterResult = (studentId, semesterId) =>
  axiosInstance.get(`/results/student/${studentId}/semester/${semesterId}`);
export const uploadResult = (data) => axiosInstance.post('/results', data);

// Update an existing result record
export const updateResult = (id, data) => axiosInstance.put(`/results/${id}`, data);

// Delete a result record
export const deleteResult = (id) => axiosInstance.delete(`/results/${id}`);
