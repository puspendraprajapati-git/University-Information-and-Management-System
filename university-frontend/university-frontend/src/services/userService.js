import axiosInstance from '../api/axiosInstance';


// Fetch all users records
export const getAllUsers = () => axiosInstance.get('/auth/users');
