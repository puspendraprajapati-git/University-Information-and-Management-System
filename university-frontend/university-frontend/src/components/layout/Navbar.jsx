import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm px-4 py-3">
      <span className="navbar-brand mb-0 h1 fw-bold text-primary">University Portal</span>
      <div className="ms-auto d-flex align-items-center">
        <span className="me-3 fw-medium text-dark">
          {user?.username}
          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary ms-2 rounded-pill px-3 py-1">
            {user?.role}
          </span>
        </span>
        <button className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold shadow-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;