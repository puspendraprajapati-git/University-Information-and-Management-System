import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Navigation bar displayed on all dashboard pages
const Navbar = () => {
  // Get logged-in user details and logout function
  const { user, logout } = useAuth();

  // Used to navigate between pages
  const navigate = useNavigate();

  // Handle user logout
  const handleLogout = () => {
    // Clear user session
    logout();

    // Redirect to the login page
    navigate("/login");
  };

  return (
    // Bootstrap navigation bar
    <nav className="navbar navbar-dark bg-dark px-3">

      {/* Application title */}
      <span className="navbar-brand mb-0 h1">
        University Portal
      </span>

      {/* Display logged-in user information */}
      <div className="d-flex align-items-center text-white">

        <span className="me-3">
          {user?.username}

          {/* Show the user's role */}
          <span className="badge bg-secondary ms-2">
            {user?.role}
          </span>
        </span>

        {/* Logout button */}
        <button
          className="btn btn-outline-light btn-sm"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>
    </nav>
  );
};

export default Navbar;