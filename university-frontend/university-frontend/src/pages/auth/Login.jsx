import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  // Store the username and password entered by the user
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // Used to disable the login button while the request is processing
  const [loading, setLoading] = useState(false);

  // Get the login function from AuthContext
  const { login } = useAuth();

  // Used to navigate to different pages after successful login
  const navigate = useNavigate();

  // Update the input field whenever the user types
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    // Prevent page refresh
    e.preventDefault();

    // Show loading state
    setLoading(true);

    try {
      // Send login request to the backend
      const data = await loginUser(formData);

      // Save user details and JWT token
      login(
        {
          userId: data.userId,
          username: data.username,
          role: data.role,
        },
        data.token
      );

      // Show success message
      toast.success(`Welcome back, ${data.username}!`);

      // Redirect the user based on their role
      if (data.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (data.role === "FACULTY") {
        navigate("/faculty/dashboard");
      } else if (data.role === "STUDENT") {
        navigate("/student/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      // Display the error message received from the backend
      const message =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";

      toast.error(message);
    } finally {
      // Stop loading whether login succeeds or fails
      setLoading(false);
    }
  };

  return (
    // Center the login card on the screen
    <div
      className="d-flex justify-content-center align-items-center bg-light"
      style={{ minHeight: "100vh" }}
    >
      {/* Login Card */}
      <div
        className="card shadow-sm p-4"
        style={{ width: "400px" }}
      >
        <h3 className="text-center mb-4">
          University Portal Login
        </h3>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>

          {/* Username Input */}
          <div className="mb-3">
            <label className="form-label">
              Username
            </label>

            <input
              type="text"
              className="form-control"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-3">
            <label className="form-label">
              Password
            </label>

            <input
              type="password"
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Registration Link */}
        <p className="text-center mt-3 mb-0">
          Don't have an account?{" "}
          <Link to="/register">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;