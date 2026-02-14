import React from 'react';
import { X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categories = [
  {
    id: 'cat-001',
    name: 'Бонсай Нівакі',
    icon: 'https://images.prom.ua/6510283244_w640_h640_bonsaj-nivaki-pinus.jpg',
  },
  {
    id: 'cat-002',
    name: 'Туя Колумна',
    icon: 'https://images.prom.ua/5107358816_w640_h640_tuya-kolumna-columna.jpg',
  },
  {
    id: 'cat-003',
    name: 'Туя Смарагд',
    icon: 'https://images.prom.ua/5107353705_w640_h640_tuya-smaragd-smaragd.jpg',
  },
  {
    id: 'cat-004',
    name: 'Самшит',
    icon: 'https://images.prom.ua/5027226901_w640_h640_samshit-vichnozelenij-arborestsens.jpg',
  },
  {
    id: 'cat-005',
    name: 'Хвойні рослини',
    icon: 'https://images.prom.ua/713633902_w640_h640_hvojni-roslini.jpg',
  },
  {
    id: 'cat-006',
    name: 'Листопадні дерева та кущі',
    icon: 'https://images.prom.ua/701884790_w640_h640_listopadni-dereva-ta.jpg',
  },
  {
    id: 'cat-007',
    name: 'Куляста Туя Глобоса',
    icon: 'https://images.prom.ua/4858672644_w640_h640_kulyasta-tuya-globosa.jpg',
  },
  {
    id: 'cat-008',
    name: 'Катальпа',
    icon: 'https://images.prom.ua/4958829409_w640_h640_katalpa-catalpa.jpg',
  },
  {
    id: 'cat-009',
    name: 'Ялина',
    icon: 'https://images.prom.ua/5027326802_w640_h640_yalina.jpg',
  },
  {
    id: 'cat-010',
    name: 'Кімнатні рослини',
    icon: 'https://images.prom.ua/6901216283_w640_h640_kimnatni-roslini.jpg',
  },
];

const CatalogModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName) => {
    navigate(`/catalog?category=${encodeURIComponent(categoryName)}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Panel - Full screen on mobile, centered on desktop */}
      <div className="absolute inset-0 sm:inset-3 md:inset-6 lg:inset-y-8 lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 lg:max-w-3xl lg:w-full bg-white flex flex-col sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-5 sm:py-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="w-12"></div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Каталог рослин</h2>
          <button 
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-white/60 rounded-full transition-colors"
            data-testid="catalog-modal-close"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.name)}
                className="w-full flex flex-col items-center gap-3 p-4 sm:p-5 hover:bg-green-50 active:bg-green-100 transition-all duration-200 rounded-2xl border border-gray-100 hover:border-green-300 hover:shadow-lg group"
                data-testid={`catalog-modal-${category.id}`}
              >
                {/* Category Image - Much larger */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-2xl overflow-hidden bg-gray-100 shadow-md group-hover:shadow-xl transition-all duration-300">
                  <img 
                    src={category.icon} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                
                {/* Category Name */}
                <span className="text-center text-sm sm:text-base md:text-lg font-semibold text-gray-800 group-hover:text-green-700 transition-colors leading-tight">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogModal;
