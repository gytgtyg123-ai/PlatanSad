import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Helper function to get full image URL
export const getImageUrl = (url) => {
  if (!url) return '';
  // Already a full URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Relative path - prepend API URL and use /api prefix for routing
  if (url.startsWith('/uploads/')) {
    return `${API_URL}/api${url}`;
  }
  return url;
};

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Admin Auth
export const adminLogin = async (credentials) => {
  const response = await axios.post(`${API_URL}/api/admin/login`, credentials);
  return response.data;
};

export const verifyAdmin = async () => {
  const response = await axios.get(`${API_URL}/api/admin/verify`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Dashboard Stats
export const getDashboardStats = async () => {
  const response = await axios.get(`${API_URL}/api/admin/stats`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getRevenueChart = async (days = 7) => {
  const response = await axios.get(`${API_URL}/api/admin/revenue-chart?days=${days}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getTopProducts = async (limit = 5) => {
  const response = await axios.get(`${API_URL}/api/admin/top-products?limit=${limit}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Products Management
export const getAllProducts = async (params = {}) => {
  const response = await axios.get(`${API_URL}/api/products`, {
    params,
    headers: getAuthHeader()
  });
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await axios.post(`${API_URL}/api/products`, productData, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const updateProduct = async (productId, productData) => {
  const response = await axios.put(`${API_URL}/api/products/${productId}`, productData, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const deleteProduct = async (productId) => {
  const response = await axios.delete(`${API_URL}/api/products/${productId}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Categories Management
export const getAllCategories = async () => {
  const response = await axios.get(`${API_URL}/api/categories`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await axios.post(`${API_URL}/api/admin/categories`, categoryData, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const updateCategory = async (categoryId, categoryData) => {
  const response = await axios.put(`${API_URL}/api/admin/categories/${categoryId}`, categoryData, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const deleteCategory = async (categoryId) => {
  const response = await axios.delete(`${API_URL}/api/admin/categories/${categoryId}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Orders Management
export const getAllOrders = async (params = {}) => {
  const response = await axios.get(`${API_URL}/api/admin/orders`, {
    params,
    headers: getAuthHeader()
  });
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await axios.put(`${API_URL}/api/admin/orders/${orderId}/status`, 
    { status }, 
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const deleteOrder = async (orderId) => {
  const response = await axios.delete(`${API_URL}/api/admin/orders/${orderId}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Image Upload
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${API_URL}/api/admin/upload-image`, formData, {
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'multipart/form-data'
    }
  });
  
  // Повертаємо URL (відносний шлях, який буде оброблений getImageUrl)
  return response.data;
};

// Orders Statistics
export const getOrdersStats = async () => {
  const response = await axios.get(`${API_URL}/api/admin/orders/stats`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getOrdersChart = async (days = 7) => {
  const response = await axios.get(`${API_URL}/api/admin/orders/chart?days=${days}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getOrdersByStatus = async () => {
  const response = await axios.get(`${API_URL}/api/admin/orders/by-status`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getTopCustomers = async (limit = 10) => {
  const response = await axios.get(`${API_URL}/api/admin/orders/top-customers?limit=${limit}`, {
    headers: getAuthHeader()
  });
  return response.data;
};


// Site Settings Management
export const getSiteSettings = async () => {
  const response = await axios.get(`${API_URL}/api/admin/site-settings`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const saveSiteSettings = async (settingsData) => {
  const response = await axios.post(`${API_URL}/api/admin/site-settings`, 
    { settings_data: settingsData },
    {
      headers: getAuthHeader()
    }
  );
  return response.data;
};

// Quick Orders Management
export const getQuickOrders = async () => {
  const response = await axios.get(`${API_URL}/api/quick-orders`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const updateQuickOrderStatus = async (orderId, status) => {
  const response = await axios.put(`${API_URL}/api/admin/quick-orders/${orderId}/status`, 
    { status }, 
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const deleteQuickOrder = async (orderId) => {
  const response = await axios.delete(`${API_URL}/api/admin/quick-orders/${orderId}`, {
    headers: getAuthHeader()
  });
  return response.data;
};