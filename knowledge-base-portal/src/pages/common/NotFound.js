
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">
        <div className="mb-4">
          <i className="bi bi-exclamation-triangle-fill display-1 text-warning"></i>
        </div>
        <h1 className="display-4 fw-bold text-dark mb-3">404</h1>
        <h2 className="h4 text-muted mb-4">Page Not Found</h2>
        <p className="lead text-muted mb-4">
          Sorry, the page you are looking for doesn't exist or you don't have permission to access it.
        </p>
        <div className="d-flex justify-content-center gap-2">
          <Link to="/" className="btn btn-primary">
            <i className="bi bi-house me-1"></i>
            Go Home
          </Link>
          <Link to="/login" className="btn btn-outline-secondary">
            <i className="bi bi-box-arrow-in-right me-1"></i>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
