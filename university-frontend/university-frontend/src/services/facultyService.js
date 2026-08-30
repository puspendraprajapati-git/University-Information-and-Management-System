import axiosInstance from '../api/axiosInstance';


// Fetch all faculty records
export const getAllFaculty = () => axiosInstance.get('/faculty');

// Fetch a specific faculty by ID
export const getFacultyById = (id) => axiosInstance.get(`/faculty/${id}`);

// Fetch a specific faculty by User ID
export const getFacultyByUserId = (userId) => axiosInstance.get(`/faculty/user/${userId}`);

// Create a new faculty record
export const createFaculty = (data) => axiosInstance.post('/faculty', data);

// Update an existing faculty record
export const updateFaculty = (id, data) => axiosInstance.put(`/faculty/${id}`, data);

// Delete a faculty record
export const deleteFaculty = (id) => axiosInstance.delete(`/faculty/${id}`);
