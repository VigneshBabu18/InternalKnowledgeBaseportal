import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Navbar = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return null;
  if (!isAuthenticated()) return null;

  const getRoleBasedLinks = () => {
    switch (user?.role) {
      case 'Admin':
        return (
          <>
            <li className="nav-item">
              <Link className={`nav-link${location.pathname.startsWith('/admin') ? ' active' : ''}`} to="/admin">
                <i className="bi bi-speedometer2 me-1"></i>Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link${location.pathname === '/admin/users' ? ' active' : ''}`} to="/admin/users">
                <i className="bi bi-people me-1"></i>Manage Users
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link${location.pathname === '/admin/categories' ? ' active' : ''}`} to="/admin/categories">
                <i className="bi bi-tags me-1"></i>Categories
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link${location.pathname === '/admin/approve' ? ' active' : ''}`} to="/admin/approve">
                <i className="bi bi-check-circle me-1"></i>Approve Articles
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link${location.pathname === '/admin/search' ? ' active' : ''}`} to="/admin/search">
                <i className="bi bi-search me-1"></i>Search Articles
              </Link>
            </li>
          </>
        );
      case 'Contributor':
        return (
          <>
            <li className="nav-item">
              <Link className={`nav-link${location.pathname === '/contributor' ? ' active' : ''}`} to="/contributor">
                <i className="bi bi-speedometer2 me-1"></i>Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link${location.pathname === '/contributor/articles' ? ' active' : ''}`} to="/contributor/articles">
                <i className="bi bi-file-text me-1"></i>My Articles
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link${location.pathname === '/contributor/create' ? ' active' : ''}`} to="/contributor/create">
                <i className="bi bi-plus-circle me-1"></i>Create Article
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link${location.pathname === '/browse' ? ' active' : ''}`} to="/browse">
                <i className="bi bi-book me-1"></i>Browse Articles
              </Link>
            </li>
          </>
        );
      case 'User':
        return (
          <>
            <li className="nav-item">
              <Link className={`nav-link${location.pathname === '/user' ? ' active' : ''}`} to="/user">
                <i className="bi bi-speedometer2 me-1"></i>Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link${location.pathname === '/browse' ? ' active' : ''}`} to="/browse">
                <i className="bi bi-book me-1"></i>Browse Articles
              </Link>
            </li>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-journal-bookmark me-2"></i>Knowledge Base Portal
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">{getRoleBasedLinks()}</ul>
          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              <button
                className="nav-link dropdown-toggle btn btn-link text-white border-0"
                type="button"
                id="navbarDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-person-circle me-1"></i>
                {user?.name} ({user?.role})
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                <li>
                  <Link className="dropdown-item" to="/profile">
                    <i className="bi bi-person me-2"></i>Profile
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
  <Link className="dropdown-item text-danger" to="#" onClick={handleLogout}>
    <i className="bi bi-box-arrow-right me-2"></i>Logout
  </Link>
</li>

              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
