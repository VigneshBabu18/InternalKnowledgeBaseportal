// src/pages/Admin/ApproveArticles.js
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';

const ApproveArticles = () => {
  const [pendingArticles, setPendingArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvedArticles, setApprovedArticles] = useState([]);

  useEffect(() => {
    fetchPendingArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPendingArticles = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPendingArticles();  // use correct function
      const pendings = response.data || [];
  
      setPendingArticles(pendings);
      setError('');
      setApprovedArticles([]);
    } catch (err) {
      setError('Failed to load pending articles');
      console.error('Pending articles error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprove = async (articleId) => {
    if (!window.confirm('Are you sure you want to approve this article?')) return;
    try {
      await adminAPI.approveArticle(articleId);
      // Option A: remove article from list
      setPendingArticles((prev) => prev.filter((a) => a.id !== articleId));
      // Option B (if you prefer to mark it approved in-place): setApprovedArticles(prev => [...prev, articleId])
      setApprovedArticles((prev) => [...prev, articleId]);
      alert('Article approved successfully!');
    } catch (err) {
      alert('Failed to approve article: ' + (err.response?.data || err.message));
      console.error('Approve error:', err);
    }
  };

  const handleRejectClick = (article) => {
    setSelectedArticle(article);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      await adminAPI.rejectArticle(selectedArticle.id, rejectionReason);
      setShowRejectModal(false);
      setSelectedArticle(null);
      setRejectionReason('');
      // Remove rejected article from pending list
      setPendingArticles((prev) => prev.filter((a) => a.id !== selectedArticle.id));
      alert('Article rejected successfully!');
    } catch (err) {
      alert('Failed to reject article: ' + (err.response?.data || err.message));
      console.error('Reject error:', err);
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

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">
          <i className="bi bi-check-circle me-2"></i>
          Approve Articles
        </h1>
        <button className="btn btn-outline-primary" onClick={fetchPendingArticles}>
          <i className="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-body">
          {pendingArticles.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-check-circle display-4 text-success"></i>
              <h5 className="mt-3 text-muted">All Caught Up!</h5>
              <p className="text-muted">There are no pending articles to review.</p>
            </div>
          ) : (
            <div className="row">
              {pendingArticles.map((article) => {
                const isApproved = approvedArticles.includes(article.id);
                return (
                  <div key={article.id} className="col-lg-6 col-xl-4 mb-4">
                    <div className="card h-100 border-warning">
                      <div className="card-body d-flex flex-column">
                        <div className="mb-2">
                          <span className={`badge ${isApproved ? 'bg-success' : 'bg-warning text-dark'}`}>
                            <i className={`bi ${isApproved ? 'bi-check-circle' : 'bi-hourglass-split'} me-1`}></i>
                            {isApproved ? 'Approved' : 'Pending Approval'}
                          </span>
                        </div>

                        <h5 className="card-title">{article.name}</h5>
                        <p className="card-text text-muted mb-2">{article.description}</p>

                        <div className="mb-2">
                          <small className="text-muted">
                            <strong>Category:</strong> {article.categoryName}
                          </small>
                        </div>

                        <div className="mb-2">
                          <small className="text-muted">
                            <strong>Author:</strong> {article.authorName}
                          </small>
                        </div>

                        <div className="mb-2">
                          <small className="text-muted">
                            <strong>Drive Link: </strong>
                            {article.driveLink ? (
                              <a href={article.driveLink} target="_blank" rel="noopener noreferrer">
                                Open Document
                              </a>
                            ) : (
                              <em>No drive link provided</em>
                            )}
                          </small>
                        </div>

                        <div className="mb-3">
                          <small className="text-muted">
                            <strong>Submitted:</strong>{' '}
                            {new Date(article.createdAt).toLocaleDateString()}
                          </small>
                        </div>

                        {article.content && (
                          <div className="mb-3 flex-grow-1">
                            <small className="text-muted">
                              <strong>Content Preview:</strong>
                            </small>
                            <div
                              className="text-muted small mt-1"
                              style={{
                                maxHeight: '100px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {article.content.substring(0, 200)}
                              {article.content.length > 200 && '...'}
                            </div>
                          </div>
                        )}

                        <div className="mt-auto">
                          <div className="d-grid gap-2">
                            {isApproved ? (
                              <button className="btn btn-success" disabled>
                                <i className="bi bi-check-lg me-1"></i>
                                Approved
                              </button>
                            ) : (
                              <>
                                <button
                                  className="btn btn-success"
                                  onClick={() => handleApprove(article.id)}
                                >
                                  <i className="bi bi-check-lg me-1"></i>
                                  Approve
                                </button>
                                <button
                                  className="btn btn-danger"
                                  onClick={() => handleRejectClick(article)}
                                >
                                  <i className="bi bi-x-lg me-1"></i>
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-x-circle me-2"></i>
                  Reject Article
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowRejectModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Article:</strong> {selectedArticle?.name}
                </p>
                <p>
                  <strong>Author:</strong> {selectedArticle?.authorName}
                </p>

                <div className="mb-3">
                  <label className="form-label">
                    Reason for rejection <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a clear reason for rejecting this article. This feedback will help the author improve their content."
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleRejectSubmit}
                  disabled={!rejectionReason.trim()}
                >
                  <i className="bi bi-x-lg me-1"></i>
                  Reject Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveArticles;
