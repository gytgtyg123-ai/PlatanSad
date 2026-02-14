import api from './api';

export const categoriesApi = {
  // Get all categories
  getCategories: async () => {
    const response = await api.get('/api/categories');
    return response.data;
  },

  // Get single category
  getCategory: async (categoryId) => {
    const response = await api.get(`/api/categories/${categoryId}`);
    return response.data;
  },
};