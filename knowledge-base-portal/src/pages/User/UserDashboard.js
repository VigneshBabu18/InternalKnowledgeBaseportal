import React, { useState, useEffect } from 'react';
import { profileAPI } from '../api';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);


  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getDashboard();
      setDashboardData(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3">
              <i className="bi bi-speedometer2 me-2"></i>
              User Dashboard
            </h1>
            <Link to="/browse" className="btn btn-primary">
              <i className="bi bi-book me-1"></i>
              Browse All Articles
            </Link>
          </div>

          <div className="row">
            {/* Recent Articles */}
            <div className="col-lg-6 mb-4">
              <div className="card h-100">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-clock me-2"></i>
                    Recently Added Articles
                  </h5>
                </div>
                <div className="card-body">
                  {dashboardData?.recentApproved?.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {dashboardData.recentApproved.map((article) => (
                        <div key={article.id} className="list-group-item px-0">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <Link 
                                to={`/article/${article.id}`}
                                className="text-decoration-none"
                              >
                                <h6 className="mb-1">{article.name}</h6>
                              </Link>
                              <small className="text-muted">
                                <i className="bi bi-eye me-1"></i>
                                {article.viewCount} views
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted py-4">
                      <i className="bi bi-file-text display-4"></i>
                      <p className="mt-2">No recent articles available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Most Viewed Articles */}
            <div className="col-lg-6 mb-4">
              <div className="card h-100">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-bar-chart me-2"></i>
                    Most Viewed Articles
                  </h5>
                </div>
                <div className="card-body">
                  {dashboardData?.mostViewed?.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {dashboardData.mostViewed.map((article, index) => (
                        <div key={article.id} className="list-group-item px-0">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center">
                                <span className="badge bg-primary me-2">{index + 1}</span>
                                <div>
                                  <Link 
                                    to={`/article/${article.id}`}
                                    className="text-decoration-none"
                                  >
                                    <h6 className="mb-1">{article.name}</h6>
                                  </Link>
                                  <small className="text-muted">
                                    <i className="bi bi-eye me-1"></i>
                                    {article.viewCount} views
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted py-4">
                      <i className="bi bi-bar-chart display-4"></i>
                      <p className="mt-2">No viewed articles data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-lightning me-2"></i>
                    Quick Actions
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <Link to="/browse" className="btn btn-outline-primary w-100">
                        <i className="bi bi-search me-2"></i>
                        Search Articles
                      </Link>
                    </div>
                    <div className="col-md-3 mb-3">
                      <Link to="/browse?sort=recent" className="btn btn-outline-success w-100">
                        <i className="bi bi-clock me-2"></i>
                        Recent Articles
                      </Link>
                    </div>
                    <div className="col-md-3 mb-3">
                      <Link to="/browse?sort=views" className="btn btn-outline-info w-100">
                        <i className="bi bi-bar-chart me-2"></i>
                        Popular Articles
                      </Link>
                    </div>
                    <div className="col-md-3 mb-3">
                      <Link to="/profile" className="btn btn-outline-secondary w-100">
                        <i className="bi bi-person me-2"></i>
                        My Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;