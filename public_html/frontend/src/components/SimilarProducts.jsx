import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '../api/productsApi';
import ProductCard from './ProductCard';

const SimilarProducts = ({ category, currentProductId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!category) return;
      
      try {
        setLoading(true);
        // Fetch products by category
        // Note: The backend API supports filtering by category name
        const data = await productsApi.getProducts({ category, limit: 10 });
        
        // Filter out current product and limit to 6 items for mobile scroll
        const filtered = data
          .filter(p => p.id !== currentProductId)
          .slice(0, 6);
          
        setProducts(filtered);
      } catch (error) {
        console.error('Error fetching similar products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, currentProductId]);

  if (loading || products.length === 0) return null;

  return (
    <section className="py-6 md:py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">Схожі товари</h2>
        
        {/* Desktop: Grid */}
        <div className="hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile: Horizontal scroll */}
        <div className="md:hidden overflow-x-auto -mx-4 px-4">
          <div className="flex gap-3 pb-2">
            {products.map(product => (
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

export default SimilarProducts;
