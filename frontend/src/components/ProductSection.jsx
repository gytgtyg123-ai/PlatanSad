import React, { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import { productsApi } from '../api/productsApi';
import { ChevronLeft, ChevronRight, Flame, Percent, Sparkles } from 'lucide-react';

const ProductSection = () => {
  const [activeTab, setActiveTab] = useState('hits');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productsApi.getProducts();
        // API returns {products: [], total: ...}
        setProducts(Array.isArray(data) ? data : (data.products || []));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const tabs = [
    { id: 'hits', label: 'Хіти продажів', icon: Flame, filter: (p) => p.badges?.includes('hit') || p.badges?.includes('new') || p.price > 10000 },
    { id: 'sale', label: 'Розпродаж', icon: Percent, filter: (p) => p.discount > 0 || p.oldPrice },
    { id: 'new', label: 'Новинки', icon: Sparkles, filter: (p) => p.badges?.includes('new') || Math.random() > 0.5 },
  ];

  const filteredProducts = products
    .filter(tabs.find(t => t.id === activeTab)?.filter || (() => true))
    .slice(0, 15);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-8 mb-8">
          {tabs.map((tab) => (
            <div key={tab.id} className="h-8 w-32 bg-gray-200 rounded-full animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="bg-gray-100 rounded-2xl aspect-[3/4] animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
      {/* Tabs */}
      <div className="mb-6 lg:mb-10">
        <div className="flex items-center justify-center gap-3 sm:gap-6 lg:gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 rounded-full
                  font-semibold text-sm lg:text-base
                  transition-all duration-300
                  ${isActive
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
                data-testid={`tab-${tab.id}`}
              >
                <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${isActive ? 'animate-pulse' : ''}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Products */}
      <div className="relative">
        {/* Desktop scroll buttons */}
        <button 
          onClick={() => scroll('left')}
          className="hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-xl rounded-full items-center justify-center hover:bg-gray-50 transition-all hover:scale-110 border border-gray-100"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <button 
          onClick={() => scroll('right')}
          className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-xl rounded-full items-center justify-center hover:bg-gray-50 transition-all hover:scale-110 border border-gray-100"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>

        {/* Products container */}
        {filteredProducts.length > 0 ? (
          <>
            {/* Mobile: Horizontal scroll */}
            <div 
              ref={scrollRef}
              className="lg:hidden flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredProducts.map((product) => (
                <div key={product.id} className="min-w-[160px] sm:min-w-[200px] snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Desktop: Grid */}
            <div className="hidden lg:grid lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {filteredProducts.slice(0, 10).map((product, index) => (
                <div 
                  key={product.id}
                  className="transform transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">Товарів у цій категорії поки немає</p>
          </div>
        )}
        
        {/* Count badge */}
        {filteredProducts.length > 0 && (
          <div className="text-center mt-6 lg:mt-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
              Показано {filteredProducts.length} {filteredProducts.length === 1 ? 'товар' : filteredProducts.length < 5 ? 'товари' : 'товарів'}
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
