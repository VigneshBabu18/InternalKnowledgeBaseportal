import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { articlesAPI, commentsAPI } from '../api';
import { useAuth } from '../../contexts/AuthContext';

const ArticleDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchArticle();
    fetchComments();
    recordView();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await articlesAPI.getById(id);
      setArticle(response.data);
    } catch (err) {
      setError('Failed to load article');
      console.error('Article error:', err);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentsAPI.getByArticle(id);
      setComments(response.data);
    } catch (err) {
      console.error('Comments error:', err);
    } finally {
      setLoading(false);
    }
  };

  const recordView = async () => {
    try {
      await articlesAPI.recordView(id);
    } catch (err) {
      console.error('Failed to record view:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await commentsAPI.create({
        articleId: parseInt(id),
        text: newComment,   // ✅ FIX
      });
      setNewComment('');
      fetchComments();
    } catch (err) {
      alert('Failed to add comment: ' + (err.response?.data || err.message));
    } finally {
      setSubmittingComment(false);
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

  if (error || !article) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error || 'Article not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Article Header */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="mb-3">
                <span className="badge bg-primary me-2">{article.categoryName}</span>
                <span className="badge bg-light text-dark">
                  <i className="bi bi-eye me-1"></i>
                  {article.viewCount || 0} views
                </span>
              </div>

              <h1 className="card-title h2 mb-3">{article.name}</h1>

              <div className="d-flex justify-content-between align-items-center text-muted">
                <div>
                  <i className="bi bi-person me-1"></i>
                  By {article.authorName}
                </div>
                <div>
                  <i className="bi bi-calendar me-1"></i>
                  {new Date(article.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>

              {article.description && (
                <div className="mt-3 p-3 bg-light rounded">
                  <strong>Description:</strong> {article.description}
                </div>
              )}

              {/* Drive Link */}
              {article.driveLink && (
                <div className="mt-3">
                  <a
                    href={article.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-success"
                  >
                    <i className="bi bi-link-45deg me-1"></i>
                    View Drive File
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Article Content */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="article-content">
                {article.content ? (
                  <div
                    style={{
                      whiteSpace: 'pre-wrap',
                      lineHeight: '1.6',
                      fontSize: '1.1rem',
                    }}
                  >
                    {article.content}
                  </div>
                ) : (
                  <div className="text-center text-muted py-4">
                    <i className="bi bi-file-text display-4"></i>
                    <p className="mt-2">No content available for this article.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-chat-dots me-2"></i>
                Comments ({comments.length})
              </h5>
            </div>
            <div className="card-body">
              {/* Add Comment Form */}
              {user?.role === 'User' && (
                <form onSubmit={handleCommentSubmit} className="mb-4">
                  <div className="mb-3">
                    <label className="form-label">Add a comment</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts about this article..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingComment || !newComment.trim()}
                  >
                    {submittingComment ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Posting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-chat me-1"></i>
                        Post Comment
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Comments List */}
              {comments.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-chat display-4"></i>
                  <p className="mt-2">No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                <div className="comments-list">
                  {comments.map((comment, index) => (
                    <div
                      key={comment.id}
                      className={`comment ${index !== comments.length - 1 ? 'mb-4 pb-3 border-bottom' : ''}`}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-person-circle me-2 text-primary"></i>
                          <strong>{comment.userName}</strong>
                        </div>
                        <small className="text-muted">
                          {new Date(comment.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </small>
                      </div>
                      <div className="comment-content" style={{ marginLeft: '2rem' }}>
                        {comment.text} {/* ✅ FIX */}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {user?.role !== 'User' && (
                <div className="alert alert-info mt-3" role="alert">
                  <i className="bi bi-info-circle me-2"></i>
                  Only users can add comments to articles.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
