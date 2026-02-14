import api from './api';

export const cartApi = {
  // Add item to cart
  addToCart: async (productId, quantity = 1, userId = 'guest') => {
    const response = await api.post('/api/cart/add', {
      productId,
      quantity,
      userId
    });
    return response.data;
  },

  // Get cart items
  getCart: async (userId = 'guest') => {
    const response = await api.get('/api/cart', {
      params: { userId }
    });
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (itemId, quantity) => {
    const response = await api.put(`/api/cart/${itemId}`, { quantity });
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (itemId) => {
    const response = await api.delete(`/api/cart/${itemId}`);
    return response.data;
  },

  // Clear cart
  clearCart: async (userId = 'guest') => {
    const response = await api.delete(`/api/cart/clear/${userId}`);
    return response.data;
  },
};