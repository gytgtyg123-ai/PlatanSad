import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminLogin as loginApi, verifyAdmin } from '../api/adminApi';
import { useNavigate } from 'react-router-dom';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await verifyAdmin();
      setAdmin({ username: response.username, token });
    } catch (error) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUsername');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await loginApi({ username, password });
      localStorage.setItem('adminToken', response.access_token);
      localStorage.setItem('adminUsername', response.username);
      setAdmin({ username: response.username, token: response.access_token });
      navigate('/admin/dashboard');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed';
      // Add URL to error for debugging
      const url = error.config?.url;
      return { 
        success: false, 
        error: `${errorMessage} (${url})`
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    setAdmin(null);
    navigate('/admin/login');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
