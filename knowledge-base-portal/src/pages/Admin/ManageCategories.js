// import React, { useState, useEffect } from 'react';
// import { adminAPI } from '../api';

// const ManageCategories = () => {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [editingCategory, setEditingCategory] = useState(null);
//   const [categoryForm, setCategoryForm] = useState({
//     name: '',
//     description: ''
//   });

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       setLoading(true);
//       const response = await adminAPI.getCategories();
//       setCategories(response.data);
//     } catch (err) {
//       setError('Failed to load categories');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (editingCategory) {
//         await adminAPI.updateCategory(editingCategory.id, categoryForm);
//       } else {
//         await adminAPI.createCategory(categoryForm);
//       }
//       setShowModal(false);
//       resetForm();
//       fetchCategories();
//     } catch (err) {
//       alert('Failed to save category: ' + (err.response?.data || err.message));
//     }
//   };

//   const handleEdit = (category) => {
//     setEditingCategory(category);
//     setCategoryForm({
//       name: category.name,
//       description: category.description
//     });
//     setShowModal(true);
//   };

//   const handleDelete = async (categoryId) => {
//     if (window.confirm('Are you sure you want to delete this category?')) {
//       try {
//         await adminAPI.deleteCategory(categoryId);
//         fetchCategories();
//       } catch (err) {
//         alert('Failed to delete category: ' + (err.response?.data || err.message));
//       }
//     }
//   };

//   const resetForm = () => {
//     setCategoryForm({ name: '', description: '' });
//     setEditingCategory(null);
//   };

//   return (
//     <div className="container-fluid mt-4">
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h1 className="h3">
//           <i className="bi bi-tags me-2"></i>
//           Manage Categories
//         </h1>
//         <button 
//           className="btn btn-primary"
//           onClick={() => setShowModal(true)}
//         >
//           <i className="bi bi-plus-circle me-1"></i>
//           Add Category
//         </button>
//       </div>

//       {error && (
//         <div className="alert alert-danger">
//           <i className="bi bi-exclamation-triangle me-2"></i>
//           {error}
//         </div>
//       )}

//       <div className="card">
//         <div className="card-body">
//           {loading ? (
//             <div className="text-center py-4">
//               <div className="spinner-border text-primary" role="status">
//                 <span className="visually-hidden">Loading...</span>
//               </div>
//             </div>
//           ) : (
//             <div className="table-responsive">
//               <table className="table table-striped">
//                 <thead>
//                   <tr>
//                     <th>Name</th>
//                     <th>Description</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {categories.map((category) => (
//                     <tr key={category.id}>
//                       <td>{category.name}</td>
//                       <td>{category.description}</td>
//                       <td>
//                         <button
//                           className="btn btn-outline-primary btn-sm me-2"
//                           onClick={() => handleEdit(category)}
//                         >
//                           <i className="bi bi-pencil"></i>
//                         </button>
//                         <button
//                           className="btn btn-outline-danger btn-sm"
//                           onClick={() => handleDelete(category.id)}
//                         >
//                           <i className="bi bi-trash"></i>
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">
//                   {editingCategory ? 'Edit Category' : 'Add Category'}
//                 </h5>
//                 <button 
//                   type="button" 
//                   className="btn-close"
//                   onClick={() => { setShowModal(false); resetForm(); }}
//                 ></button>
//               </div>
//               <form onSubmit={handleSubmit}>
//                 <div className="modal-body">
//                   <div className="mb-3">
//                     <label className="form-label">Name</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       value={categoryForm.name}
//                       onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
//                       required
//                     />
//                   </div>
//                   <div className="mb-3">
//                     <label className="form-label">Description</label>
//                     <textarea
//                       className="form-control"
//                       rows="3"
//                       value={categoryForm.description}
//                       onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
//                     />
//                   </div>
//                 </div>
//                 <div className="modal-footer">
//                   <button 
//                     type="button" 
//                     className="btn btn-secondary"
//                     onClick={() => { setShowModal(false); resetForm(); }}
//                   >
//                     Cancel
//                   </button>
//                   <button type="submit" className="btn btn-primary">
//                     {editingCategory ? 'Update' : 'Create'}
//                   </button>
//                 </div>
//               </form>            </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ManageCategories;

import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getCategories();
      setCategories(response.data);
    } catch (err) {
      setError('Failed to load categories');
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const alphaRegex = /^[A-Za-z\s]+$/;

    if (!categoryForm.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (!alphaRegex.test(categoryForm.name.trim())) {
      toast.error('Name should only contain letters and spaces');
      return false;
    }

    if (categoryForm.description.trim() && !alphaRegex.test(categoryForm.description.trim())) {
      toast.error('Description should only contain letters and spaces');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editingCategory) {
        await adminAPI.updateCategory(editingCategory.id, categoryForm);
        toast.success('Category updated successfully');
      } else {
        await adminAPI.createCategory(categoryForm);
        toast.success('Category created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchCategories();
    } catch (err) {
      toast.error('Failed to save category: ' + (err.response?.data || err.message));
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description
    });
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await adminAPI.deleteCategory(categoryId);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (err) {
        toast.error('Failed to delete category: ' + (err.response?.data || err.message));
      }
    }
  };

  const resetForm = () => {
    setCategoryForm({ name: '', description: '' });
    setEditingCategory(null);
  };

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">
          <i className="bi bi-tags me-2"></i>
          Manage Categories
        </h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-circle me-1"></i>
          Add Category
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.name}</td>
                      <td>{category.description}</td>
                      <td>
                        <button
                          className="btn btn-outline-primary btn-sm me-2"
                          onClick={() => handleEdit(category)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(category.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => { setShowModal(false); resetForm(); }}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => { setShowModal(false); resetForm(); }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingCategory ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategories;
