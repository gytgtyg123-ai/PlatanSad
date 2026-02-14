import React, { useState, useEffect } from 'react';
import { categoriesApi } from '../api/categoriesApi';
import { useNavigate } from 'react-router-dom';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoriesApi.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-center mb-6">Каталог рослин</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="flex-shrink-0 w-24 sm:w-28">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gray-200 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded mt-3 mx-auto w-16 animate-pulse"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-6">
        Каталог рослин
      </h2>

      {/* Categories - Horizontal scroll on mobile, grid on desktop */}
      <div 
        className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-5 lg:grid-cols-6 md:overflow-visible"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => navigate(`/catalog?category=${encodeURIComponent(category.name)}`)}
            className="flex-shrink-0 w-24 sm:w-28 md:w-auto text-center cursor-pointer group"
            data-testid={`category-${category.id}`}
          >
            {/* Circular image container */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full overflow-hidden bg-gray-100 border-2 border-transparent group-hover:border-green-500 transition-all duration-300 shadow-sm group-hover:shadow-md">
              <img
                src={category.icon}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            {/* Category name */}
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors line-clamp-2 leading-tight">
              {category.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Categories;
