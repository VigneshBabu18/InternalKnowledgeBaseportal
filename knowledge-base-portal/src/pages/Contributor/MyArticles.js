import React, { useState, useEffect } from 'react';
import { articlesAPI } from '../api';
import { Link } from 'react-router-dom';

const MyArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyArticles();
  }, []);

  const fetchMyArticles = async () => {
    try {
      setLoading(true);
      const response = await articlesAPI.getMine();
      setArticles(response.data);
    } catch (err) {
      setError('Failed to load articles');
      console.error('Articles error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (articleId) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await articlesAPI.delete(articleId);
        fetchMyArticles(); // Refresh the list
      } catch (err) {
        alert('Failed to delete article: ' + (err.response?.data || err.message));
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { class: 'bg-warning', icon: 'hourglass-split' },
      'Approved': { class: 'bg-success', icon: 'check-circle' },
      'Rejected': { class: 'bg-danger', icon: 'x-circle' }
    };
    
    const config = statusConfig[status] || { class: 'bg-secondary', icon: 'question-circle' };
    
    return (
      <span className={`badge ${config.class}`}>
        <i className={`bi bi-${config.icon} me-1`}></i>
        {status}
      </span>
    );
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

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">
          <i className="bi bi-file-text me-2"></i>
          My Articles
        </h1>
        <Link to="/contributor/create" className="btn btn-primary">
          <i className="bi bi-plus-circle me-1"></i>
          Create New Article
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-body">
          {articles.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-file-text display-4 text-muted"></i>
              <h5 className="mt-3 text-muted">No Articles Yet</h5>
              <p className="text-muted">You haven't created any articles yet.</p>
              <Link to="/contributor/create" className="btn btn-primary">
                <i className="bi bi-plus-circle me-1"></i>
                Create Your First Article
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article.id}>
                      <td>
                        <div>
                          <strong>{article.name}</strong>
                          {article.description && (
                            <div className="text-muted small">{article.description}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {article.categoryName}
                        </span>
                      </td>
                      <td>{getStatusBadge(article.status)}</td>
                      <td>
                        <span className="badge bg-info">
                          <i className="bi bi-eye me-1"></i>
                          {article.viewCount || 0}
                        </span>
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(article.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm" role="group">
                          {article.status === 'Approved' && (
                            <Link
                              to={`/article/${article.id}`}
                              className="btn btn-outline-primary"
                              title="View Article"
                            >
                              <i className="bi bi-eye"></i>
                            </Link>
                          )}
                          <Link
                            to={`/contributor/edit/${article.id}`}
                            className="btn btn-outline-warning"
                            title="Edit Article"
                          >
                            <i className="bi bi-pencil"></i>
                          </Link>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(article.id)}
                            title="Delete Article"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Status Legend */}
      <div className="card mt-4">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="bi bi-info-circle me-2"></i>
            Article Status Guide
          </h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-2">
              <span className="badge bg-warning me-2">
                <i className="bi bi-hourglass-split me-1"></i>
                Pending
              </span>
              <small className="text-muted">Waiting for admin approval</small>
            </div>
            <div className="col-md-4 mb-2">
              <span className="badge bg-success me-2">
                <i className="bi bi-check-circle me-1"></i>
                Approved
              </span>
              <small className="text-muted">Published and visible to users</small>
            </div>
            <div className="col-md-4 mb-2">
              <span className="badge bg-danger me-2">
                <i className="bi bi-x-circle me-1"></i>
                Rejected
              </span>
              <small className="text-muted">Needs revision before publishing</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyArticles;