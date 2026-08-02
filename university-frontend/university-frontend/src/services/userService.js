import axiosInstance from '../api/axiosInstance';

export const getAllUsers = () => axiosInstance.get('/auth/users');