import axiosInstance from '../api/axiosInstance';


// Fetch all students records
export const getAllStudents = () => axiosInstance.get('/students');

// Fetch a specific studentbyid by ID
export const getStudentById = (id) => axiosInstance.get(`/students/${id}`);

// Create a new student record
export const createStudent = (data) => axiosInstance.post('/students', data);

// Update an existing student record
export const updateStudent = (id, data) => axiosInstance.put(`/students/${id}`, data);

// Delete a student record
export const deleteStudent = (id) => axiosInstance.delete(`/students/${id}`);

// Search students records
export const searchStudents = (name) => axiosInstance.get(`/students/search?name=${name}`);
