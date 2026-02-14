import api from './api';

export const ordersApi = {
  // Create order
  createOrder: async (orderData) => {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  },

  // Get user orders
  getOrders: async (userId = 'guest') => {
    const response = await api.get('/api/orders', {
      params: { userId }
    });
    return response.data;
  },

  // Get specific order
  getOrder: async (orderId) => {
    const response = await api.get(`/api/orders/${orderId}`);
    return response.data;
  },
};