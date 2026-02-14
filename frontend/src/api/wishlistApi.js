import api from './api';

export const wishlistApi = {
  // Add item to wishlist
  addToWishlist: async (productId, userId = 'guest') => {
    const response = await api.post('/api/wishlist/add', {
      productId,
      userId
    });
    return response.data;
  },

  // Get wishlist items
  getWishlist: async (userId = 'guest') => {
    const response = await api.get('/api/wishlist', {
      params: { userId }
    });
    return response.data;
  },

  // Remove item from wishlist
  removeFromWishlist: async (itemId) => {
    const response = await api.delete(`/api/wishlist/${itemId}`);
    return response.data;
  },
};