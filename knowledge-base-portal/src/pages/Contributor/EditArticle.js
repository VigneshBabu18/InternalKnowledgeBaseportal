import React, { useState, useEffect } from 'react';
import { articlesAPI, adminAPI } from '../api';
import { Link, useParams, useNavigate } from 'react-router-dom';

const EditArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    categoryId: '',
    driveLink: '',  // new drive link field
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    if (id) fetchArticle();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await adminAPI.getCategories();
      setCategories(response.data);
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  const fetchArticle = async () => {
    try {
      const response = await articlesAPI.getById(id);
      const article = response.data;
      setFormData({
        name: article.name,
        description: article.description,
        content: article.content || '',
        categoryId: article.categoryId.toString(),
        driveLink: article.driveLink || ''
      });
      setError('');
    } catch (err) {
      setError('Failed to load article');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await articlesAPI.update(id, {
        ...formData,
        categoryId: parseInt(formData.categoryId),
        driveLink: formData.driveLink.trim() === '' ? null : formData.driveLink.trim()
      });
      alert('Article updated and sent for approval!');
      navigate('/contributor/articles');
    } catch (err) {
      setError('Failed to update article: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3">
              <i className="bi bi-pencil-square me-2"></i>
              Edit Article
            </h1>
            <Link to="/contributor/articles" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-1"></i>
              Back to My Articles
            </Link>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card">
                <div className="card-body">
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">
                        Article Title <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter article title"
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="categoryId" className="form-label">
                        Category <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="categoryId"
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="driveLink" className="form-label">
                        Drive Link
                      </label>
                      <input
                        type="url"
                        className="form-control"
                        id="driveLink"
                        name="driveLink"
                        value={formData.driveLink}
                        onChange={handleChange}
                        placeholder="Enter Google Drive or document URL"
                      />
                      <div className="form-text">
                        Optional: Provide a link to your article document stored on a cloud drive.
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">
                        Description <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        rows="3"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        placeholder="Brief description of the article"
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="content" className="form-label">
                        Content
                      </label>
                      <textarea
                        className="form-control"
                        id="content"
                        name="content"
                        rows="10"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="Write your article content here..."
                      />
                    </div>

                    <div className="d-flex justify-content-between">
                      <Link to="/contributor/articles" className="btn btn-secondary">
                        <i className="bi bi-x me-1"></i>
                        Cancel
                      </Link>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check me-1"></i>
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
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

export default EditArticle;
