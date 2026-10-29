import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { GraduationCap, UserPlus } from "lucide-react";
import { registerUser } from "../../services/authService";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    role: "STUDENT",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
      };
      await registerUser(payload);
      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed. Please try again.";
      const validationErrors = err.response?.data?.validationErrors;

      if (validationErrors) {
        Object.values(validationErrors).forEach((msg) => toast.error(msg));
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: "480px" }}>
        <div className="text-center mb-4">
          <div className="auth-brand-badge mx-auto">
            <GraduationCap size={24} />
          </div>
          <h3 className="fw-bold text-dark mb-1">Create Account</h3>
          <p className="text-muted small">Join EduCore University Portal today</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-3">
            <div className="col-12">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="name@university.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className="col-12">
              <label className="form-label">Register as</label>
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
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 mt-2"
            disabled={loading}
          >
            <UserPlus size={18} />
            <span>{loading ? "Creating account..." : "Register"}</span>
          </button>
        </form>

        <p className="text-center text-muted small mt-4 mb-0">
          Already have an account?{" "}
          <Link to="/login" className="text-primary fw-semibold text-decoration-none">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
