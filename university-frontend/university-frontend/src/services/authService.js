import axiosInstance from "../api/axiosInstance";


// Register a new user
export const registerUser = async (data) => {
  const response = await axiosInstance.post("/auth/register", data);

  return response.data;
};


// Authenticate user login
export const loginUser = async (data) => {
  const response = await axiosInstance.post("/auth/login", data);

  return response.data;
};
