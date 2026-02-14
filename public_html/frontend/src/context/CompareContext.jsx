import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

const CompareContext = createContext();

export const useCompare = () => useContext(CompareContext);

export const CompareProvider = ({ children }) => {
  const [compareItems, setCompareItems] = useState(() => {
    try {
      const saved = localStorage.getItem('compareItems');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error parsing compare items:', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('compareItems', JSON.stringify(compareItems));
  }, [compareItems]);

  const addToCompare = (product) => {
    if (compareItems.find(item => item.id === product.id)) {
      toast.info('Товар вже в списку порівняння');
      return;
    }
    
    if (compareItems.length >= 4) {
      toast.warning('Можна порівнювати максимум 4 товари');
      return;
    }

    // Check if category matches (optional, but good UX)
    if (compareItems.length > 0 && compareItems[0].category !== product.category) {
      toast.warning('Бажано порівнювати товари однієї категорії');
      // We allow it but warn, or we could block it. Letting it pass for flexibility.
    }

    setCompareItems([...compareItems, product]);
    toast.success('Додано до порівняння');
  };

  const removeFromCompare = (productId) => {
    setCompareItems(compareItems.filter(item => item.id !== productId));
    toast.success('Видалено з порівняння');
  };

  const clearCompare = () => {
    setCompareItems([]);
    toast.success('Список порівняння очищено');
  };

  const isInCompare = (productId) => {
    return compareItems.some(item => item.id === productId);
  };

  return (
    <CompareContext.Provider value={{
      compareItems,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isInCompare,
      compareCount: compareItems.length
    }}>
      {children}
    </CompareContext.Provider>
  );
};
