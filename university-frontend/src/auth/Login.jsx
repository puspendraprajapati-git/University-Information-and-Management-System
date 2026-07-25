import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiLogIn, FiUser, FiBriefcase, FiShield } from 'react-icons/fi';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      role: 'admin',
      email: 'admin@uims.com', // Pre-filled for demo
      password: 'password'
    }
  });

  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const user = await login(data.email, data.password, data.role);
      toast.success(`Welcome back, ${user.username}!`);
      
      // Navigate based on role if no 'from' location was specified
      if (from === '/') {
        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'faculty') navigate('/faculty');
        else if (user.role === 'student') navigate('/student');
      } else {
        navigate(from, { replace: true });
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
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
        style={{ width: '100%', maxWidth: '500px' }}
      >
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3 shadow-sm" style={{ width: '60px', height: '60px' }}>
            <FiLogIn size={28} />
          </div>
          <h3 className="fw-bold text-dark">Welcome Back</h3>
          <p className="text-muted">Sign in to your UIMS portal</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          
          {/* Role Selection */}
          <div className="mb-4">
            <label className="form-label fw-bold text-secondary small text-uppercase letter-spacing-1">Login As</label>
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
          </div>

          <div className="form-floating mb-3">
            <input 
              type="email" 
              className={`form-control bg-light border-0 shadow-none ${errors.email ? 'is-invalid' : ''}`} 
              id="floatingInput" 
              placeholder="name@example.com"
              {...register('email', { required: 'Email is required' })}
            />
            <label htmlFor="floatingInput" className="text-muted">Email address</label>
            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
          </div>
          
          <div className="form-floating mb-4">
            <input 
              type="password" 
              className={`form-control bg-light border-0 shadow-none ${errors.password ? 'is-invalid' : ''}`} 
              id="floatingPassword" 
              placeholder="Password"
              {...register('password', { required: 'Password is required' })}
            />
            <label htmlFor="floatingPassword" className="text-muted">Password</label>
            {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
          </div>

          <div className="d-grid gap-2">
            <button className="btn btn-primary btn-lg rounded-pill shadow-sm py-3 fw-bold" type="submit" disabled={isLoading}>
              {isLoading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : 'Sign In'}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <span className="text-muted">Don't have an account? </span>
            <Link to="/signup" className="text-decoration-none fw-bold text-primary">Sign Up</Link>
          </div>
          
          <div className="text-center mt-4 p-3 bg-light rounded-3 border">
            <small className="text-muted d-block mb-2 fw-semibold">Demo Credentials:</small>
            <small className="text-muted d-block" style={{ fontSize: '0.8rem' }}>
              <strong>Admin:</strong> admin@uims.com <br/>
              <strong>Faculty:</strong> faculty@uims.com <br/>
              <strong>Student:</strong> student@uims.com <br/>
              <span className="text-primary mt-1 d-block"><strong>Password for all:</strong> password</span>
            </small>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
