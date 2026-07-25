import React from 'react';
import { FaBars, FaSearch, FaBell, FaMoon, FaSun, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const TopNavbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar navbar-expand border-bottom px-4 shadow-sm" style={{ backgroundColor: 'var(--sidebar-bg)', height: '70px' }}>
      <button className="btn btn-light border-0 me-3" onClick={toggleSidebar}>
        <FaBars />
      </button>

      <form className="d-none d-md-flex me-auto">
        <div className="input-group">
          <span className="input-group-text bg-body-tertiary border-end-0 text-muted">
            <FaSearch />
          </span>
          <input 
            type="text" 
            className="form-control bg-body-tertiary border-start-0" 
            placeholder="Search here..." 
            style={{ boxShadow: 'none' }}
          />
        </div>
      </form>

      <ul className="navbar-nav align-items-center ms-auto">
        <li className="nav-item me-3">
          <button className="btn btn-light rounded-circle p-2 position-relative" onClick={toggleTheme}>
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>
        </li>
        <li className="nav-item me-3">
          <button className="btn btn-light rounded-circle p-2 position-relative">
            <FaBell />
            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
              <span className="visually-hidden">New alerts</span>
            </span>
          </button>
        </li>
        <li className="nav-item dropdown">
          <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            {user?.profile_image ? (
              <img src={user.profile_image} alt="Profile" className="rounded-circle me-2" width="35" height="35" />
            ) : (
              <FaUserCircle className="fs-3 me-2 text-secondary" />
            )}
            <span className="d-none d-md-inline fw-medium text-body">{user?.username}</span>
          </a>
          <ul className="dropdown-menu dropdown-menu-end shadow border-0" aria-labelledby="navbarDropdown">
            <li><a className="dropdown-item" href="#">Profile</a></li>
            <li><a className="dropdown-item" href="#">Settings</a></li>
            <li><hr className="dropdown-divider" /></li>
            <li><button className="dropdown-item text-danger">Logout</button></li>
          </ul>
        </li>
      </ul>
    </nav>
  );
};

export default TopNavbar;
