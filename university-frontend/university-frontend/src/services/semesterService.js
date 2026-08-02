import axiosInstance from '../api/axiosInstance';

export const getAllSemesters = () => axiosInstance.get('/semesters');
export const getSemesterById = (id) => axiosInstance.get(`/semesters/${id}`);
export const createSemester = (data) => axiosInstance.post('/semesters', data);
export const updateSemester = (id, data) => axiosInstance.put(`/semesters/${id}`, data);
export const deleteSemester = (id) => axiosInstance.delete(`/semesters/${id}`);