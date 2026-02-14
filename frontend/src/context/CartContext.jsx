import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/cartApi';
import { toast } from '../components/CustomToast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

// ✅ Нормалізація: приймає product або cartItem і повертає productId
const getProductId = (obj) => {
  if (!obj) return null;
  // якщо передали cart item
  if (obj.productId) return obj.productId;
  // якщо передали product
  if (obj.id) return obj.id;
  return null;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const userId = 'guest';

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const items = await cartApi.getCart(userId);
      // Normalize cart items to include product data at top level
      const normalizedItems = (items || []).map(item => ({
        ...item,
        productId: item.product_id || item.productId,
        productName: item.product?.name || item.productName,
        productImage: item.product?.image || item.productImage,
        price: item.product?.price || item.price || 0,
      }));
      setCartItems(normalizedItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productOrCartItem, quantity = 1, options = {}) => {
    const productId = getProductId(productOrCartItem);

    if (!productId) {
      console.error('addToCart: cannot determine productId from', productOrCartItem);
      if (!options?.silent) toast.error('Помилка: невідомий товар');
      return;
    }

    const name =
      productOrCartItem?.name ||
      productOrCartItem?.productName ||
      'Товар';

    try {
      setLoading(true);
      await cartApi.addToCart(productId, quantity, userId);
      await fetchCart();

      if (!options?.silent) toast.cartAdd(name);
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (!options?.silent) toast.error('Помилка додавання до кошика');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setLoading(true);
      await cartApi.updateCartItem(itemId, newQuantity);
      await fetchCart();
      toast.cartUpdate();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Помилка оновлення кількості');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId, productName, options = {}) => {
    try {
      setLoading(true);
      await cartApi.removeFromCart(itemId);
      await fetchCart();
      if (!options?.silent) toast.cartRemove(productName);
    } catch (error) {
      console.error('Error removing from cart:', error);
      if (!options?.silent) toast.error('Помилка видалення з кошика');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await cartApi.clearCart(userId);
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals using product data from API
  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    return sum + (price * item.quantity);
  }, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
    cartTotal,
    cartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
