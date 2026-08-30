import axios from "axios";

const axiosInstance = axios.create({

  baseURL: process.env.REACT_APP_API_URL || "/api",

  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(

  (config) => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(

  (response) => {
    return response;
  },

  (error) => {

    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;