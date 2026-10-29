import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { GraduationCap, LogIn } from "lucide-react";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginUser(formData);
      login({ userId: data.userId, username: data.username, role: data.role }, data.token);
      toast.success(`Welcome back, ${data.username}!`);
      
      if (data.role === "ADMIN") navigate("/admin/dashboard");
      else if (data.role === "FACULTY") navigate("/faculty/dashboard");
      else if (data.role === "STUDENT") navigate("/student/dashboard");
      else navigate("/");
    } catch (err) {
      const message = err.response?.data?.message || "Login failed. Please check your credentials.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div className="auth-brand-badge mx-auto">
            <GraduationCap size={24} />
          </div>
          <h3 className="fw-bold text-dark mb-1">Welcome back</h3>
          <p className="text-muted small">Sign in to your EduCore University Portal</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
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

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label mb-0">Password</label>
            </div>
            <input
              type="password"
              className="form-control"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            <LogIn size={18} />
            <span>{loading ? "Signing in..." : "Sign In"}</span>
          </button>
        </form>

        <p className="text-center text-muted small mt-4 mb-0">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary fw-semibold text-decoration-none">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
