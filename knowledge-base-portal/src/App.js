import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Profile from './components/Profile';
import 'bootstrap/dist/css/bootstrap.min.css';


// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashBoard';
import ManageUsers from './pages/Admin/ManageUsers';
import ManageCategories from './pages/Admin/ManageCategories';
import ApproveArticles from './pages/Admin/ApproveArticles';
import SearchArticles from './pages/Admin/SearchArticles';

// Contributor Pages
import ContributorDashboard from './pages/Contributor/ContributorDashboard';
import MyArticles from './pages/Contributor/MyArticles';
import CreateArticle from './pages/Contributor/CreateArticle';
import EditArticle from './pages/Contributor/EditArticle';

// User Pages
import UserDashboard from './pages/User/UserDashboard';
import BrowseArticles from './pages/User/BrowseArticles';
import ArticleDetail from './pages/User/ArticleDetail';

// Common Pages
import NotFound from './pages/common/NotFound';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Navbar />
        <main className="container-fluid">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute allowedRoles={['Admin']}>
                  <ManageUsers />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <PrivateRoute allowedRoles={['Admin']}>
                  <ManageCategories />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/approve"
              element={
                <PrivateRoute allowedRoles={['Admin']}>
                  <ApproveArticles />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/search"
              element={
                <PrivateRoute allowedRoles={['Admin']}>
                  <SearchArticles />
                </PrivateRoute>
              }
            />

            {/* Contributor Routes */}
            <Route
              path="/contributor"
              element={
                <PrivateRoute allowedRoles={['Contributor']}>
                  <ContributorDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/contributor/articles"
              element={
                <PrivateRoute allowedRoles={['Contributor']}>
                  <MyArticles />
                </PrivateRoute>
              }
            />
            <Route
              path="/contributor/create"
              element={
                <PrivateRoute allowedRoles={['Contributor']}>
                  <CreateArticle />
                </PrivateRoute>
              }
            />
            <Route
              path="/contributor/edit/:id"
              element={
                <PrivateRoute allowedRoles={['Contributor']}>
                  <EditArticle />
                </PrivateRoute>
              }
            />

            {/* User Routes */}
            <Route
              path="/user"
              element={
                <PrivateRoute allowedRoles={['User']}>
                  <UserDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/browse"
              element={
                <PrivateRoute allowedRoles={['User', 'Contributor']}>
                  <BrowseArticles />
                </PrivateRoute>
              }
            />
            <Route
              path="/article/:id"
              element={
                <PrivateRoute allowedRoles={['User', 'Contributor', 'Admin']}>
                  <ArticleDetail />
                </PrivateRoute>
              }
            />

            {/* Profile Route */}
            <Route
              path="/profile"
              element={
                <PrivateRoute allowedRoles={['Admin', 'Contributor', 'User']}>
                  <Profile />
                </PrivateRoute>
              }
            />

            {/* Default and 404 routes */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
