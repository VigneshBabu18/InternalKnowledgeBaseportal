import React, { useState, useEffect } from 'react';
import { profileAPI } from '../api';

const ContributorDashboard = () => {
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
              Contributor Dashboard
            </h1>
            <button 
              className="btn btn-outline-primary"
              onClick={fetchDashboardData}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="row mb-4">
            <div className="col-xl-3 col-md-6 mb-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="fs-4 fw-bold">{dashboardData?.totalArticles || 0}</div>
                      <div>Total Articles</div>
                    </div>
                    <div className="align-self-center">
                      <i className="bi bi-file-text fs-2 opacity-75"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-3">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="fs-4 fw-bold">{dashboardData?.pending || 0}</div>
                      <div>Pending</div>
                    </div>
                    <div className="align-self-center">
                      <i className="bi bi-hourglass-split fs-2 opacity-75"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="fs-4 fw-bold">{dashboardData?.approved || 0}</div>
                      <div>Approved</div>
                    </div>
                    <div className="align-self-center">
                      <i className="bi bi-check-circle fs-2 opacity-75"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-3">
              <div className="card bg-danger text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="fs-4 fw-bold">{dashboardData?.rejected || 0}</div>
                      <div>Rejected</div>
                    </div>
                    <div className="align-self-center">
                      <i className="bi bi-x-circle fs-2 opacity-75"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Viewed My Articles */}
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-bar-chart me-2"></i>
                Your Most Viewed Articles
              </h5>
            </div>
            <div className="card-body">
              {dashboardData?.topViewedMine?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Article Name</th>
                        <th>Status</th>
                        <th>Views</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.topViewedMine.map((article, index) => (
                        <tr key={article.id}>
                          <td>{index + 1}</td>
                          <td>{article.name}</td>
                          <td>
                            <span className={`badge ${
                              article.status === 'Approved' ? 'bg-success' :
                              article.status === 'Pending' ? 'bg-warning' :
                              'bg-danger'
                            }`}>
                              {article.status}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-primary">
                              {article.viewCount} views
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-file-text display-4"></i>
                  <p className="mt-2">No articles created yet</p>
                  <a href="/contributor/create" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-1"></i>
                    Create Your First Article
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributorDashboard;