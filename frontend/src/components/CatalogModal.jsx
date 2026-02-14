import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { categoriesApi } from '../api/categoriesApi';

// Fallback icons for categories
const categoryIcons = {
  'Бонсай Pinus sylvestris': 'https://images.prom.ua/6510283244_w640_h640_bonsaj-nivaki-pinus.jpg',
  'Туя "Колумна"': 'https://images.prom.ua/5107358816_w640_h640_tuya-kolumna-columna.jpg',
  'Туя "Смарагд"': 'https://images.prom.ua/5107353705_w640_h640_tuya-smaragd-smaragd.jpg',
  'Самшит вічнозелений': 'https://images.prom.ua/5027226901_w640_h640_samshit-vichnozelenij-arborestsens.jpg',
  'Хвойні рослини': 'https://images.prom.ua/713633902_w640_h640_hvojni-roslini.jpg',
  'Листопадні дерева та кущі': 'https://images.prom.ua/701884790_w640_h640_listopadni-dereva-ta.jpg',
  'Куляста Туя Глобоза': 'https://images.prom.ua/4858672644_w640_h640_kulyasta-tuya-globosa.jpg',
  'Катальпа': 'https://images.prom.ua/4958829409_w640_h640_katalpa-catalpa.jpg',
  'Ялина': 'https://images.prom.ua/5027326802_w640_h640_yalina.jpg',
  'Кімнатні рослини': 'https://images.prom.ua/6901216283_w640_h640_kimnatni-roslini.jpg',
};

const defaultIcon = 'https://images.prom.ua/713633902_w640_h640_hvojni-roslini.jpg';

const CatalogModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoriesApi.getCategories();
        // Filter out test categories and ones with 0 products
        const filtered = (data || []).filter(cat => 
          cat.count > 0 && !cat.name.toLowerCase().includes('test')
        );
        setCategories(filtered);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const handleCategoryClick = (categoryName) => {
    navigate(`/catalog?category=${encodeURIComponent(categoryName)}`);
    onClose();
  };

  const getCategoryIcon = (category) => {
    // Check if category has its own icon
    if (category.icon && category.icon.startsWith('http')) {
      return category.icon;
    }
    // Use mapped icon or default
    return categoryIcons[category.name] || defaultIcon;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Panel */}
      <div className="absolute inset-0 sm:inset-3 md:inset-6 lg:inset-y-8 lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 lg:max-w-4xl lg:w-full bg-white flex flex-col sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 shrink-0">
          <div className="w-10 sm:w-12"></div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Каталог рослин</h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-white/60 rounded-full transition-colors"
            data-testid="catalog-modal-close"
          >
            <X className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 overscroll-contain">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.name)}
                  className="w-full flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 hover:bg-green-50 active:bg-green-100 transition-all duration-200 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-green-300 hover:shadow-lg group"
                  data-testid={`catalog-category-${category.id}`}
                >
                  {/* Category Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 shadow-md group-hover:shadow-xl transition-all duration-300">
                    <img 
                      src={getCategoryIcon(category)} 
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = defaultIcon;
                      }}
                    />
                  </div>
                  
                  {/* Category Name & Count */}
                  <div className="text-center">
                    <span className="block text-xs sm:text-sm md:text-base font-semibold text-gray-800 group-hover:text-green-700 transition-colors leading-tight line-clamp-2">
                      {category.name}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                      {category.count} товарів
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogModal;
