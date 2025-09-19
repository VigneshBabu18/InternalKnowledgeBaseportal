import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const axios = (await import('axios')).default;
      const token = localStorage.getItem('token');

      const response = await axios.get('http://localhost:5066/api/admin/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setDashboardData(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const barData = {
    labels: ['Users', 'Contributors', 'Pending', 'Approved'],
    datasets: [
      {
        label: 'Counts',
        data: [
          dashboardData?.totalUsers || 0,
          dashboardData?.contributors || 0,
          dashboardData?.pendingApprovals || 0,
          dashboardData?.approvedDocuments || 0,
        ],
        backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#0dcaf0'],
      },
    ],
  };

  const doughnutData = {
    labels: ['Approved', 'Pending'],
    datasets: [
      {
        data: [dashboardData?.approvedDocuments || 0, dashboardData?.pendingApprovals || 0],
        backgroundColor: ['#0dcaf0', '#ffc107'],
        borderWidth: 1,
      },
    ],
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

  if (error)
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );

  return (
    <div className="container-fluid mt-4">
      <div className="alert alert-info d-flex align-items-center mb-4 shadow-sm">
        <i className="bi bi-person-circle fs-3 me-3"></i>
        <div>
          <strong>Welcome back, Admin!</strong>
          <div className="text-muted">Here's your dashboard overview.</div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">
          <i className="bi bi-speedometer2 me-2"></i> Admin Dashboard
        </h1>
        <button className="btn btn-outline-primary" onClick={fetchDashboardData}>
          <i className={`bi bi-arrow-clockwise me-1 ${loading ? 'spin' : ''}`}></i> Refresh
        </button>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4 mb-4">
        <Card title="Total Users" value={dashboardData?.totalUsers} icon="bi-people" bg="primary" />
        <Card title="Contributors" value={dashboardData?.contributors} icon="bi-person-badge" bg="success" />
        <Card title="Pending Approvals" value={dashboardData?.pendingApprovals} icon="bi-hourglass-split" bg="warning" />
        <Card title="Approved Documents" value={dashboardData?.approvedDocuments} icon="bi-file-earmark-check" bg="info" />
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="card-title mb-0">User Analytics</h5>
            </div>
            <div className="card-body">
              <Bar data={barData} />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="card-title mb-0">Approval Status</h5>
            </div>
            <div className="card-body">
              <Doughnut data={doughnutData} />
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <i className="bi bi-bar-chart me-2"></i> Most Viewed Articles
          </h5>
        </div>
        <div className="card-body">
          {dashboardData?.topViewed?.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th><i className="bi bi-file-earmark-text me-1"></i> Article Name</th>
                    <th><i className="bi bi-eye me-1"></i> Views</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.topViewed.map((article, index) => (
                    <tr key={article.id}>
                      <td>{index + 1}</td>
                      <td>{article.name}</td>
                      <td>
                        <span className="badge bg-primary">{article.viewCount} views</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-muted py-4">
              <i className="bi bi-file-text display-4"></i>
              <p className="mt-2">No articles data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value, icon, bg }) => (
  <div className="col">
    <div className={`card text-white bg-${bg} h-100 shadow-sm`}>
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <div className="fs-4 fw-bold">{value || 0}</div>
          <div>{title}</div>
        </div>
        <i className={`bi ${icon} fs-2 opacity-75`}></i>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
