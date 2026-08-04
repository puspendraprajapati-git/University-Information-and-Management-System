import axiosInstance from '../api/axiosInstance';


// Fetch all subjects records
export const getAllSubjects = () => axiosInstance.get('/subjects');

// Create a new subject record
export const createSubject = (data) => axiosInstance.post('/subjects', data);

// Update an existing subject record
export const updateSubject = (id, data) => axiosInstance.put(`/subjects/${id}`, data);

// Delete a subject record
export const deleteSubject = (id) => axiosInstance.delete(`/subjects/${id}`);
