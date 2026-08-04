import axiosInstance from '../api/axiosInstance';


// Fetch all faculty records
export const getAllFaculty = () => axiosInstance.get('/faculty');

// Fetch a specific facultybyid by ID
export const getFacultyById = (id) => axiosInstance.get(`/faculty/${id}`);

// Create a new faculty record
export const createFaculty = (data) => axiosInstance.post('/faculty', data);

// Update an existing faculty record
export const updateFaculty = (id, data) => axiosInstance.put(`/faculty/${id}`, data);

// Delete a faculty record
export const deleteFaculty = (id) => axiosInstance.delete(`/faculty/${id}`);
