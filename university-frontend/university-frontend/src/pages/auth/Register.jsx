import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { registerUser } from "../../services/authService";

const Register = () => {
  // Store the registration form data
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    role: "STUDENT",
  });

  // Used to show the loading state while registering
  const [loading, setLoading] = useState(false);

  // Used to navigate to another page after successful registration
  const navigate = useNavigate();

  // Update the corresponding field when the user types
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle the registration form submission
  const handleSubmit = async (e) => {
    // Prevent page refresh
    e.preventDefault();

    // Enable loading state
    setLoading(true);

    try {
      // Send registration data to the backend
      await registerUser(formData);

      // Show success message
      toast.success("Registration successful! Please login.");

      // Redirect the user to the login page
      navigate("/login");
    } catch (err) {
      // Get the error message returned by the backend
      const message =
        err.response?.data?.message ||
        "Registration failed. Please try again.";

      // Check if validation errors are available
      const validationErrors = err.response?.data?.validationErrors;

      if (validationErrors) {
        // Display each validation error separately
        Object.values(validationErrors).forEach((msg) => {
          toast.error(msg);
        });
      } else {
        // Display a general error message
        toast.error(message);
      }
    } finally {
      // Disable loading state after the request is complete
      setLoading(false);
    }
  };

  return (
    // Center the registration card on the screen
    <div
      className="d-flex justify-content-center align-items-center bg-light"
      style={{ minHeight: "100vh" }}
    >
      {/* Registration Card */}
      <div
        className="card shadow-sm p-4"
        style={{ width: "420px" }}
      >
        <h3 className="text-center mb-4">
          Create Account
        </h3>

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>

          {/* Username Field */}
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

          {/* Email Field */}
          <div className="mb-3">
            <label className="form-label">
              Email
            </label>

            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password Field */}
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
              minLength={6}
            />
          </div>

          {/* Role Selection */}
          <div className="mb-3">
            <label className="form-label">
              Role
            </label>

            <select
              className="form-select"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="STUDENT">Student</option>
              <option value="FACULTY">Faculty</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="btn btn-success w-100"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-3 mb-0">
          Already have an account?{" "}
          <Link to="/login">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;