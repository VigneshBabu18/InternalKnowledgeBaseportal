import React, { useState, useEffect } from 'react';
import { articlesAPI, adminAPI } from '../api';
import { Link } from 'react-router-dom';
import '../User/BrowseArticles.css'; // custom styles

const BrowseArticles = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    sort: 'recent',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const res = await adminAPI.getCategories();
      setCategories(res.data);
    } catch (err) {
      console.error('Categories error:', err);
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = {
        q: filters.search || undefined,
        categoryId: filters.categoryId || undefined,
        sort: filters.sort,
      };
      const res = await articlesAPI.browse(params);
      setArticles(res.data);
    } catch (err) {
      setError('Failed to load articles');
      console.error('Articles error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', categoryId: '', sort: 'recent' });
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row" style={{ height: 'calc(100vh - 80px)' }}>
        
        {/* LEFT SIDEBAR */}
        <div className="col-md-3 border-end" style={{ overflowY: 'auto' }}>
          <h5 className="mb-3">
            <i className="bi bi-funnel me-2"></i> Filters
          </h5>
          <div className="mb-3">
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-control"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by title or description..."
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              name="categoryId"
              value={filters.categoryId}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Sort</label>
            <select
              className="form-select"
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
            >
              <option value="recent">Most Recent</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
          <button
            className="btn btn-outline-secondary w-100"
            onClick={clearFilters}
          >
            <i className="bi bi-arrow-clockwise me-1"></i> Reset
          </button>
        </div>

        {/* RIGHT CONTENT */}
        <div className="col-md-9" style={{ overflowY: 'auto' }}>
          <h1 className="h3 mb-4">
            <i className="bi bi-book me-2"></i> Browse Articles
          </h1>

          {error && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2"></i> {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-file-earmark-text display-4"></i>
              <h5>No Articles Found</h5>
            </div>
          ) : (
            <div className="article-list">
              {articles.map((a) => (
                <div key={a.id} className="article-card shadow-sm">
                  <div className="article-header">
                    <span className="badge bg-info text-dark">{a.categoryName}</span>
                    <span className="views">
                      <i className="bi bi-eye me-1"></i>{a.viewCount || 0}
                    </span>
                  </div>
                  <h5 className="mt-2">{a.name}</h5>
                  <p className="text-muted">{a.description}</p>
                  <div className="article-footer">
                    <small className="text-muted">
                      By {a.authorName} • {new Date(a.createdAt).toLocaleDateString()}
                    </small>
                    <Link
                      to={`/article/${a.id}`}
                      className="btn btn-sm read-more-btn"
                    >
                      Read More <i className="bi bi-arrow-right ms-1"></i>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BrowseArticles;
