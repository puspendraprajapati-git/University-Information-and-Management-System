import axiosInstance from '../api/axiosInstance';


// Fetch all departments records
export const getAllDepartments = () => axiosInstance.get('/departments');

// Fetch a specific departmentbyid by ID
export const getDepartmentById = (id) => axiosInstance.get(`/departments/${id}`);

// Create a new department record
export const createDepartment = (data) => axiosInstance.post('/departments', data);

// Update an existing department record
export const updateDepartment = (id, data) => axiosInstance.put(`/departments/${id}`, data);

// Delete a department record
export const deleteDepartment = (id) => axiosInstance.delete(`/departments/${id}`);
