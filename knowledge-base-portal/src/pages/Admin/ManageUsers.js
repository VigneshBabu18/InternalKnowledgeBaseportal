import React, { useState, useEffect } from 'react';
import { adminAPI, authAPI } from '../api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    employeeId: '',
    name: '',
    email: '',
    password: '',
    role: 3,
  });

  // Edit User Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getUsers();
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users');
      toast.error('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const isRelevantzEmail = (email) => /^[A-Za-z0-9._%+-]+@relevantz\.com$/.test(email);
  const isValidName = (name) => /^[A-Za-z\s]+$/.test(name);
  const isValidPassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  // Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();

    // Field Validations
    if (!newUser.employeeId || newUser.employeeId.length < 3) {
      toast.error('Employee ID must be at least 3 characters');
      return;
    }
    if (!newUser.name || !isValidName(newUser.name)) {
      toast.error('Name can only contain letters and spaces');
      return;
    }
    if (!isRelevantzEmail(newUser.email)) {
      toast.error('Email must end with @relevantz.com');
      return;
    }
    if (!isValidPassword(newUser.password)) {
      toast.error(
        'Password must be at least 8 characters, include uppercase, lowercase, number, and special character'
      );
      return;
    }

    try {
      await authAPI.createUser(newUser);
      setShowCreateModal(false);
      setNewUser({ employeeId: '', name: '', email: '', password: '', role: 3 });
      fetchUsers();
      toast.success('User created successfully');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create user';
      setError(msg);
      toast.error(msg);
      console.error(err);
    }
  };

  // Update User
  const handleUpdateUser = async (e) => {
    e.preventDefault();

    // Field Validations
    if (!editUser.employeeId || editUser.employeeId.length < 3) {
      toast.error('Employee ID must be at least 3 characters');
      return;
    }
    if (!editUser.name || !isValidName(editUser.name)) {
      toast.error('Name can only contain letters and spaces');
      return;
    }
    if (!isRelevantzEmail(editUser.email)) {
      toast.error('Email must end with @relevantz.com');
      return;
    }
    if (editUser.password && editUser.password.trim() !== '' && !isValidPassword(editUser.password)) {
      toast.error(
        'Password must be at least 8 characters, include uppercase, lowercase, number, and special character'
      );
      return;
    }

    try {
      const payload = {
        employeeId: editUser.employeeId,
        name: editUser.name,
        email: editUser.email,
        role: editUser.role,
        isActive: editUser.isActive,
      };
      if (editUser.password && editUser.password.trim() !== '') {
        payload.password = editUser.password;
      }

      await adminAPI.updateUser(editUser.id, payload);
      setShowEditModal(false);
      setEditUser(null);
      fetchUsers();
      toast.success('User updated successfully');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update user';
      setError(msg);
      toast.error(msg);
      console.error(err);
    }
  };

  // Delete User
  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(id);
        fetchUsers();
        toast.success('User deleted successfully');
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Failed to delete user';
        toast.error(msg);
        console.error(err);
      }
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
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3"><i className="bi bi-people me-2"></i> Manage Users</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <i className="bi bi-plus-circle me-1"></i> Add User
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* USER TABLE */}
      <div className="card">
        <div className="card-body">
          {users.length === 0 ? (
            <p className="text-center text-muted">No users available</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.employeeId || '-'}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span
                          className={`badge ${
                            user.role === 'Admin' ? 'bg-info' :
                            user.role === 'Contributor' ? 'bg-primary' : 'bg-secondary'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${user.isActive ? 'bg-success' : 'bg-danger'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete User"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleCreateUser}>
              <div className="modal-header">
                <h5 className="modal-title">Add New User</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newUser.employeeId}
                    onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: parseInt(e.target.value, 10) })}
                  >
                    <option value={1}>Admin</option>
                    <option value={2}>Contributor</option>
                    <option value={3}>User</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && editUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleUpdateUser}>
              <div className="modal-header">
                <h5 className="modal-title">Edit User</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editUser.employeeId}
                    onChange={(e) => setEditUser({ ...editUser, employeeId: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editUser.name}
                    onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: parseInt(e.target.value, 10) })}
                  >
                    <option value={2}>Contributor</option>
                    <option value={3}>User</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={editUser.isActive ? 1 : 0}
                    onChange={(e) => setEditUser({ ...editUser, isActive: e.target.value === '1' })}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">New Password (optional)</label>
                  <input
                    type="password"
                    className="form-control"
                    onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                  />
                </div>
              </div>  
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
