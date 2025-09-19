import React, { useState, useEffect } from 'react';
import { articlesAPI, adminAPI } from '../api';
import { Link } from 'react-router-dom';

const CreateArticle = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    categoryId: '',
    driveLink: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await adminAPI.getCategories();
      setCategories(response.data);
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: response.data[0].id.toString() }));
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, fetch: 'Failed to load categories' }));
    }
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.name || formData.name.trim().length < 4 || formData.name.trim().length > 100) {
      newErrors.name = 'Title must be between 4 and 100 characters';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (!formData.description || formData.description.trim().length < 10 || formData.description.trim().length > 500) {
      newErrors.description = 'Description must be between 10 and 500 characters';
    }

    if (formData.driveLink) {
      try {
        const url = new URL(formData.driveLink);
        if (!url.hostname.includes('relevantz.com')) {
          newErrors.driveLink = 'Drive link must be from relevantz.com domain';
        }
      } catch {
        newErrors.driveLink = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      await articlesAPI.create({
        ...formData,
        categoryId: parseInt(formData.categoryId),
        driveLink: formData.driveLink.trim() === '' ? null : formData.driveLink.trim()
      });
      alert('Article created successfully and sent for approval!');
      setFormData({ name: '', description: '', content: '', categoryId: categories[0]?.id.toString() || '', driveLink: '' });
      setErrors({});
    } catch (err) {
      setErrors(prev => ({ ...prev, submit: 'Failed to create article: ' + (err.response?.data || err.message) }));
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

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3">
              <i className="bi bi-plus-circle me-2"></i>
              Create New Article
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
                  {errors.fetch && (
                    <div className="alert alert-danger">{errors.fetch}</div>
                  )}
                  {errors.submit && (
                    <div className="alert alert-danger">{errors.submit}</div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">
                        Article Title <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter article title"
                      />
                      {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="categoryId" className="form-label">
                        Category <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${errors.categoryId ? 'is-invalid' : ''}`}
                        id="categoryId"
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {errors.categoryId && <div className="invalid-feedback">{errors.categoryId}</div>}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="driveLink" className="form-label">
                        Drive Link
                      </label>
                      <input
                        type="url"
                        className={`form-control ${errors.driveLink ? 'is-invalid' : ''}`}
                        id="driveLink"
                        name="driveLink"
                        value={formData.driveLink}
                        onChange={handleChange}
                        placeholder="Enter document URL (must contain relevantz.com)"
                      />
                      {errors.driveLink && <div className="invalid-feedback">{errors.driveLink}</div>}
                      <div className="form-text">Optional: Provide a link to your article document stored on relevantz.com drive.</div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">
                        Description <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                        id="description"
                        name="description"
                        rows="3"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Brief description of the article"
                      />
                      {errors.description && <div className="invalid-feedback">{errors.description}</div>}
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
                            Creating...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check me-1"></i>
                            Create Article
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  <div className="mt-4 p-3 bg-light rounded">
                    <h6 className="text-muted mb-2">
                      <i className="bi bi-info-circle me-1"></i>
                      What happens next?
                    </h6>
                    <ul className="list-unstyled mb-0 text-muted small">
                      <li>• Your article will be submitted for admin approval</li>
                      <li>• You'll be able to track the approval status in "My Articles"</li>
                      <li>• Once approved, the article will be visible to all users</li>
                      <li>• You can edit your article before or after approval</li>
                    </ul>
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

export default CreateArticle;
