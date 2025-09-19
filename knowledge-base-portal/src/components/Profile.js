import React, { useState, useEffect } from 'react';
// Current (incorrect casing)
import { profileAPI } from '../api';

import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // For admin, we don't have profile data from API
      if (user?.role === 'Admin') {
        setProfileData({
          name: user.name,
          email: user.email,
          role: user.role,
          isAdmin: true
        });
      } else {
        const response = await profileAPI.get();
        setProfileData(response.data);
        setFormData({
          name: response.data.name,
          password: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      if (user?.role === 'Admin') {
        // For admin, set basic info from localStorage
        setProfileData({
          name: user.name,
          email: user.email,
          role: user.role,
          isAdmin: true
        });
        setFormData({
          name: user.name,
          password: '',
          confirmPassword: ''
        });
      } else {
        setError('Failed to load profile data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (profileData?.isAdmin) {
      alert('Admin profile cannot be updated via this interface.');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      setUpdateLoading(true);
      const updateData = {
        name: formData.name
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }

      await profileAPI.update(updateData);
      setEditing(false);
      fetchProfile();
      alert('Profile updated successfully');
      
      // Update localStorage name if changed
      if (formData.name !== user.name) {
        localStorage.setItem('name', formData.name);
        window.location.reload(); // Refresh to update navbar
      }
    } catch (err) {
      alert('Failed to update profile: ' + (err.response?.data || err.message));
    } finally {
      setUpdateLoading(false);
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
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">
                <i className="bi bi-person-circle me-2"></i>
                Profile Settings
              </h4>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {profileData && (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Employee ID</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileData.employeeId || 'N/A'}
                      disabled
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={profileData.email}
                      disabled
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileData.role}
                      disabled
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!editing || profileData.isAdmin}
                      required
                    />
                  </div>

                  {editing && !profileData.isAdmin && (
                    <>
                      <div className="mb-3">
                        <label className="form-label">New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Leave blank to keep current password"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Confirm New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </>
                  )}

                  <div className="d-flex justify-content-between">
                    {!profileData.isAdmin && (
                      <>
                        {!editing ? (
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setEditing(true)}
                          >
                            <i className="bi bi-pencil me-1"></i>
                            Edit Profile
                          </button>
                        ) : (
                          <div>
                            <button
                              type="submit"
                              className="btn btn-success me-2"
                              disabled={updateLoading}
                            >
                              {updateLoading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-check me-1"></i>
                                  Save Changes
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => {
                                setEditing(false);
                                setFormData({
                                  name: profileData.name,
                                  password: '',
                                  confirmPassword: ''
                                });
                              }}
                            >
                              <i className="bi bi-x me-1"></i>
                              Cancel
                            </button>
                          </div>
                        )}
                      </>
                    )}
                    
                    {profileData.isAdmin && (
                      <div className="alert alert-info mb-0" style={{ fontSize: '0.9em' }}>
                        <i className="bi bi-info-circle me-2"></i>
                        Admin profiles are managed through configuration files.
                      </div>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;