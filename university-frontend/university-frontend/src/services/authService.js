// Import the custom Axios instance
// It already contains the base URL and JWT interceptors
import axiosInstance from "../api/axiosInstance";

// Function to register a new user
export const registerUser = async (data) => {
  // Send a POST request to the backend with the user's registration details
  const response = await axiosInstance.post("/auth/register", data);

  // Return only the response data
  return response.data;
};

// Function to log in an existing user
export const loginUser = async (data) => {
  // Send the username/email and password to the login API
  const response = await axiosInstance.post("/auth/login", data);

  // Return the data received from the backend
  // Example:
  // {
  //   token: "...",
  //   userId: 1,
  //   username: "vikash",
  //   role: "ADMIN"
  // }
  return response.data;
};