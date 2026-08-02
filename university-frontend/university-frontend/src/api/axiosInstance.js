// Import Axios library for making HTTP requests
import axios from "axios";

/*
|--------------------------------------------------------------------------
| Create a custom Axios instance
|--------------------------------------------------------------------------
| Instead of writing the API URL and headers in every request,
| we create one common Axios object that can be reused throughout
| the application.
*/
const axiosInstance = axios.create({

  // Base URL of the backend API
  // Every request will automatically start with this URL.
  // Example:
  // axiosInstance.get("/students")
  // becomes:
  // http://localhost:5000/api/students
  baseURL: "http://localhost:5000/api",

  // Default headers sent with every request
  headers: {
    "Content-Type": "application/json",
  },
});


/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
| This code runs BEFORE every API request is sent.
|
| Purpose:
| Automatically attach the JWT token so that protected
| routes can verify the logged-in user.
*/
axiosInstance.interceptors.request.use(

  // This function receives the request configuration
  (config) => {

    // Get the JWT token stored after login
    const token = localStorage.getItem("token");

    // If token exists, add it to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Return the updated request configuration
    return config;
  },

  // If any error occurs while preparing the request
  (error) => {
    return Promise.reject(error);
  }
);


/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
| This code runs AFTER every response is received.
|
| Purpose:
| Detect invalid or expired JWT tokens automatically.
*/
axiosInstance.interceptors.response.use(

  // If request is successful, simply return the response
  (response) => {
    return response;
  },

  // Handle API errors
  (error) => {

    /*
    ----------------------------------------------------------
    | HTTP Status Code 401 = Unauthorized
    |
    | This usually means:
    | - JWT token has expired
    | - Token is invalid
    | - User is not authenticated
    ----------------------------------------------------------
    */
    if (error.response && error.response.status === 401) {

      // Remove saved login information
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect the user back to the login page
      window.location.href = "/login";
    }

    // Pass the error back to the component
    return Promise.reject(error);
  }
);


// Export this Axios instance so it can be used anywhere
// Example:
// import axiosInstance from "../services/axiosInstance";
export default axiosInstance;