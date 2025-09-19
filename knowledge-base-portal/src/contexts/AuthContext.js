// import React, { createContext, useContext, useState, useEffect } from 'react';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Check if user is logged in on app load
//     const token = localStorage.getItem('token');
//     const role = localStorage.getItem('role');
//     const name = localStorage.getItem('name');
//     const email = localStorage.getItem('email');

//     if (token && role && name && email) {
//       setUser({ token, role, name, email });
//     }
//     setLoading(false);
//   }, []);

//   const login = async (credentials) => {
//     try {
//       // Dynamic import to avoid circular imports
//       const { authAPI } = await import('../api');
//       const response = await authAPI.login(credentials);
//       const { token, role, name, email } = response.data;

//       // Store in localStorage
//       localStorage.setItem('token', token);
//       localStorage.setItem('role', role);
//       localStorage.setItem('name', name);
//       localStorage.setItem('email', email);

//       // Update state
//       setUser({ token, role, name, email });

//       return { success: true, role };
//     } catch (error) {
//       console.error('Login error:', error);
//       return { 
//         success: false, 
//         error: error.response?.data || 'Login failed' 
//       };
//     }
//   };

//   const logout = () => {
//     // Clear localStorage
//     localStorage.removeItem('token');
//     localStorage.removeItem('role');
//     localStorage.removeItem('name');
//     localStorage.removeItem('email');

//     // Clear state
//     setUser(null);
//   };

//   const isAuthenticated = () => {
//     return !!user && !!user.token;
//   };

//   const hasRole = (role) => {
//     return user && user.role === role;
//   };

//   const hasAnyRole = (roles) => {
//     return user && roles.includes(user.role);
//   };

//   const value = {
//     user,
//     login,
//     logout,
//     isAuthenticated,
//     hasRole,
//     hasAnyRole,
//     loading
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api'; // Direct import for clarity, adjust path as needed

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore user from localStorage on initial mount
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');

    if (token && role && name && email) {
      setUser({ token, role, name, email });
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, role, name, email } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('name', name);
      localStorage.setItem('email', email);

      setUser({ token, role, name, email });

      return { success: true, role };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const isAuthenticated = () => !!user && !!user.token;
  const hasRole = (role) => user?.role === role;
  const hasAnyRole = (roles) => roles.includes(user?.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        hasRole,
        hasAnyRole,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
