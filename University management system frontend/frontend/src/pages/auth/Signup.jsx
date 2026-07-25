import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiUserPlus, FiUser, FiBriefcase, FiShield } from 'react-icons/fi';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      role: 'student'
    }
  });
  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const user = await signup(data.username, data.email, data.password, data.role);
      toast.success(`Account created successfully! Welcome, ${user.username}!`);
      
      // Navigate based on selected role
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'faculty') navigate('/faculty');
      else navigate('/student');
    } catch (error) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light py-5">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card shadow-lg p-4 premium-card border-0 rounded-4" 
        style={{ width: '100%', maxWidth: '550px' }}
      >
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3 shadow-sm" style={{ width: '60px', height: '60px' }}>
            <FiUserPlus size={28} />
          </div>
          <h3 className="fw-bold text-dark">Create Account</h3>
          <p className="text-muted">Join the University Management System</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          
          <div className="mb-4">
            <label className="form-label fw-bold text-secondary small text-uppercase letter-spacing-1">I am registering as a...</label>
            <div className="d-flex gap-3">
              <div className="form-check flex-fill p-0">
                <input 
                  type="radio" 
                  className="btn-check" 
                  name="role" 
                  id="roleStudent" 
                  value="student"
                  {...register('role')}
                />
                <label className="btn btn-outline-primary w-100 p-3 rounded-3 shadow-sm d-flex flex-column align-items-center gap-2 border-2" htmlFor="roleStudent">
                  <FiUser size={24} />
                  <span className="fw-semibold">Student</span>
                </label>
              </div>
              
              <div className="form-check flex-fill p-0">
                <input 
                  type="radio" 
                  className="btn-check" 
                  name="role" 
                  id="roleFaculty" 
                  value="faculty"
                  {...register('role')}
                />
                <label className="btn btn-outline-primary w-100 p-3 rounded-3 shadow-sm d-flex flex-column align-items-center gap-2 border-2" htmlFor="roleFaculty">
                  <FiBriefcase size={24} />
                  <span className="fw-semibold">Faculty</span>
                </label>
              </div>
              
              <div className="form-check flex-fill p-0">
                <input 
                  type="radio" 
                  className="btn-check" 
                  name="role" 
                  id="roleAdmin" 
                  value="admin"
                  {...register('role')}
                />
                <label className="btn btn-outline-primary w-100 p-3 rounded-3 shadow-sm d-flex flex-column align-items-center gap-2 border-2" htmlFor="roleAdmin">
                  <FiShield size={24} />
                  <span className="fw-semibold">Admin</span>
                </label>
              </div>
            </div>
            {errors.role && <div className="text-danger small mt-2">{errors.role.message}</div>}
          </div>

          <div className="form-floating mb-3">
            <input 
              type="text" 
              className={`form-control bg-light border-0 shadow-none ${errors.username ? 'is-invalid' : ''}`} 
              id="usernameInput" 
              placeholder="Username"
              {...register('username', { 
                required: 'Username is required',
                minLength: { value: 3, message: 'Username must be at least 3 characters' }
              })}
            />
            <label htmlFor="usernameInput" className="text-muted">Username</label>
            {errors.username && <div className="invalid-feedback">{errors.username.message}</div>}
          </div>

          <div className="form-floating mb-3">
            <input 
              type="email" 
              className={`form-control bg-light border-0 shadow-none ${errors.email ? 'is-invalid' : ''}`} 
              id="emailInput" 
              placeholder="name@example.com"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            <label htmlFor="emailInput" className="text-muted">Email address</label>
            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
          </div>
          
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="form-floating">
                <input 
                  type="password" 
                  className={`form-control bg-light border-0 shadow-none ${errors.password ? 'is-invalid' : ''}`} 
                  id="passwordInput" 
                  placeholder="Password"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' }
                  })}
                />
                <label htmlFor="passwordInput" className="text-muted">Password</label>
                {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-floating">
                <input 
                  type="password" 
                  className={`form-control bg-light border-0 shadow-none ${errors.confirmPassword ? 'is-invalid' : ''}`} 
                  id="confirmPasswordInput" 
                  placeholder="Confirm Password"
                  {...register('confirmPassword', { 
                    required: 'Please confirm password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                />
                <label htmlFor="confirmPasswordInput" className="text-muted">Confirm Password</label>
                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
              </div>
            </div>
          </div>

          <div className="d-grid gap-2 mt-2">
            <button className="btn btn-primary btn-lg rounded-pill shadow-sm py-3 fw-bold" type="submit" disabled={isLoading}>
              {isLoading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : 'Create Account'}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <span className="text-muted">Already have an account? </span>
            <Link to="/login" className="text-decoration-none fw-bold text-primary">Sign In</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;
