import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      const redirectMap = {
        Admin: '/admin',
        Contributor: '/contributor',
        User: '/user',
      };
      navigate(redirectMap[role] || '/login', { replace: true });
    }
  }, [navigate]);

  // Validate only domain name
  const validateForm = () => {
    const domainPattern = /^[^\s@]+@relevantz\.com$/i; // any username, must end with @relevantz.com
    if (!domainPattern.test(credentials.email.trim())) {
      toast.error('Email must be a @relevantz.com address');
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    setCredentials((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    const trimmed = {
      email: credentials.email.trim(),
      password: credentials.password.trim(),
    };

    try {
      const result = await login(trimmed);

      if (result.success) {
        toast.success('Login successful!');
        const redirectMap = {
          Admin: '/admin',
          Contributor: '/contributor',
          User: '/user',
        };
        setTimeout(() => {
          navigate(redirectMap[result.role] || '/login', { replace: true });
        }, 1500);
      } else {
        const errorMsg =
          typeof result.error === 'string'
            ? result.error
            : result.error?.message || 'Login failed';

        if (
          errorMsg.toLowerCase().includes('password') &&
          errorMsg.toLowerCase().includes('incorrect')
        ) {
          toast.error('Incorrect password. Please try again.');
        } else {
          toast.error(errorMsg);
        }
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg d-flex align-items-center justify-content-center min-vh-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container">
        <div className="row justify-content-center fade-in">
          <div className="col-md-10 glass-card p-0 rounded shadow-lg overflow-hidden">
            <div className="row">
              {/* LEFT SIDE */}
              <div className="col-md-6 bg-white p-5 d-flex flex-column justify-content-center align-items-center text-center">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8Yi9kld6P2_KV9BYfMa2W-DJD7TLCisOk1Q&s"
                  alt="Knowledge Illustration"
                  className="img-fluid mb-4"
                  style={{ maxWidth: '250px' }}
                />
                <h2 className="fw-bold">Welcome Back</h2>
                <p className="text-muted mt-3" style={{ maxWidth: '400px' }}>
                  A centralized hub for all your organizational knowledge.  
                  Quickly find reliable, up-to-date information on processes, tools, policies, and best practices — all in one place.
                </p>
              </div>

              {/* RIGHT SIDE */}
              <div className="col-md-6 p-5 d-flex align-items-center justify-content-center bg-light">
                <div className="w-100" style={{ maxWidth: '400px' }}>
                  <div className="text-center mb-4">
                    <i className="bi bi-journal-bookmark display-4 text-primary"></i>
                    <h3 className="mt-2">Sign In</h3>
                    <p className="text-muted">Access your account</p>
                  </div>

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email address</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={credentials.email}
                          onChange={handleChange}
                          required
                          placeholder="Enter your email"
                          autoComplete="username"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="password" className="form-label">Password</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-lock"></i></span>
                        <input
                          type="password"
                          className="form-control"
                          id="password"
                          name="password"
                          value={credentials.password}
                          onChange={handleChange}
                          required
                          placeholder="Enter your password"
                          autoComplete="current-password"
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Signing in...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Sign In
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
};

export default Login;
