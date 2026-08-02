import axiosInstance from '../api/axiosInstance';

export const getAllResults = () => axiosInstance.get('/results');
export const getResultsByStudent = (studentId) => axiosInstance.get(`/results/student/${studentId}`);
export const getSemesterResult = (studentId, semesterId) =>
  axiosInstance.get(`/results/student/${studentId}/semester/${semesterId}`);
export const uploadResult = (data) => axiosInstance.post('/results', data);
export const updateResult = (id, data) => axiosInstance.put(`/results/${id}`, data);
export const deleteResult = (id) => axiosInstance.delete(`/results/${id}`);