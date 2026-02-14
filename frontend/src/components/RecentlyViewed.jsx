import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

const RecentlyViewed = ({ currentProductId }) => {
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    // Read from localStorage
    try {
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      // Filter out current product from display if needed, or show it. 
      // Usually we show what was viewed *before*, or just the history including current.
      // Let's exclude current product from the list to avoid duplication if it's the main focus
      const filtered = viewed.filter(p => p.id !== currentProductId).slice(0, 6);
      setRecentProducts(filtered);
    } catch (e) {
      console.error(e);
    }
  }, [currentProductId]);

  if (recentProducts.length === 0) return null;

  return (
    <section className="py-6 md:py-8 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">Ви переглядали</h2>
        
        {/* Desktop: Grid */}
        <div className="hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recentProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile: Horizontal scroll */}
        <div className="md:hidden overflow-x-auto -mx-4 px-4">
          <div className="flex gap-3 pb-2">
            {recentProducts.map(product => (
              <div key={product.id} className="flex-shrink-0 w-[160px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Helper to add to history
export const addToRecentlyViewed = (product) => {
  try {
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    // Remove if exists
    const filtered = viewed.filter(p => p.id !== product.id);
    // Add to front
    filtered.unshift({
      id: product.id,
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice,
      image: product.image,
      badges: product.badges,
      discount: product.discount,
      category: product.category,
      stock: product.stock
    });
    // Keep max 10
    const trimmed = filtered.slice(0, 10);
    localStorage.setItem('recentlyViewed', JSON.stringify(trimmed));
  } catch (e) {
    console.error('Error saving recently viewed:', e);
  }
};

export default RecentlyViewed;
