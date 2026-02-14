import React from 'react';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingCart, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComparePage = () => {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  if (compareItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Список порівняння порожній</h1>
        <p className="text-gray-600 mb-8">Додайте товари до порівняння з каталогу</p>
        <button
          onClick={() => navigate('/catalog')}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Перейти до каталогу
        </button>
      </div>
    );
  }

  // Identify all unique features/keys if we had dynamic attributes. 
  // For now, we compare standard fields: Price, Stock, Category, Rating (if exists), etc.
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Порівняння товарів</h1>
          <button
            onClick={clearCompare}
            className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span className="hidden sm:inline">Очистити список</span>
          </button>
        </div>

        {/* Scrollable container for table */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left min-w-[150px] bg-gray-50 border-b border-r sticky left-0 z-10">
                  Характеристика
                </th>
                {compareItems.map(item => (
                  <th key={item.id} className="p-4 border-b min-w-[200px] relative align-top">
                    <button
                      onClick={() => removeFromCompare(item.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1"
                      title="Видалити"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div 
                      className="cursor-pointer group"
                      onClick={() => navigate(`/products/${item.id}`)}
                    >
                      <div className="aspect-square w-32 mx-auto mb-3 overflow-hidden rounded-lg bg-gray-100">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-800 group-hover:text-green-600 mb-2 line-clamp-2 min-h-[40px]">
                        {item.name}
                      </h3>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="font-bold text-lg text-green-600">
                        {item.price} грн
                      </span>
                      {item.oldPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {item.oldPrice}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(item, 1)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md flex items-center justify-center gap-2 text-sm transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      В кошик
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="p-4 font-medium text-gray-600 bg-gray-50 border-r sticky left-0">Наявність</td>
                {compareItems.map(item => (
                  <td key={item.id} className="p-4 text-center">
                    {item.stock > 0 ? (
                      <span className="text-green-600 font-medium">В наявності</span>
                    ) : (
                      <span className="text-red-500 font-medium">Немає</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-600 bg-gray-50 border-r sticky left-0">Категорія</td>
                {compareItems.map(item => (
                  <td key={item.id} className="p-4 text-center text-sm text-gray-700">
                    {item.category}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-600 bg-gray-50 border-r sticky left-0">Артикул</td>
                {compareItems.map(item => (
                  <td key={item.id} className="p-4 text-center text-sm text-gray-700">
                    {item.article || '-'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-gray-600 bg-gray-50 border-r sticky left-0">Опис</td>
                {compareItems.map(item => (
                  <td key={item.id} className="p-4 text-sm text-gray-600 min-w-[200px]">
                    <div className="line-clamp-4 hover:line-clamp-none transition-all cursor-pointer">
                      {item.description}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
