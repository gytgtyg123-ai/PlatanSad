import api from './api';

export const productsApi = {
  // Get all products with filters
  getProducts: async (params = {}) => {
    // Set high limit by default to get all products
    const defaultParams = { limit: 500, ...params };
    const response = await api.get('/api/products', { params: defaultParams });
    return response.data;
  },

  // Get single product
  getProduct: async (productId) => {
    const response = await api.get(`/api/products/${productId}`);
    return response.data;
  },

  // Search products
  searchProducts: async (searchQuery) => {
    const response = await api.get('/api/products', {
      params: { search: searchQuery }
    });
    return response.data;
  },

  // Filter products
  filterProducts: async (filters) => {
    const response = await api.get('/api/products', {
      params: filters
    });
    return response.data;
  },
};