import React, { useState } from 'react';
import { X, Phone, User, ShoppingBag, CheckCircle, Sparkles } from 'lucide-react';
import { toast } from './CustomToast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const QuickOrderModal = ({ product, isOpen, onClose, quantity = 1 }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.customerName.trim()) {
      toast.error("Введіть ваше ім'я");
      return;
    }
    
    if (!formData.customerPhone.trim()) {
      toast.error('Введіть номер телефону');
      return;
    }

    // Phone validation (simple)
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(formData.customerPhone.replace(/\s/g, ''))) {
      toast.error('Невірний формат телефону');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/quick-order`, {
        productId: product.id,
        quantity: quantity,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        notes: formData.notes
      });

      setSuccess(true);
      toast.quickOrder();
      
      // Закриваємо через 2 секунди після успіху
      setTimeout(() => {
        setFormData({ customerName: '', customerPhone: '', notes: '' });
        setSuccess(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error creating quick order:', error);
      const message = error.response?.data?.detail || 'Помилка оформлення';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl transform transition-all duration-300 ${success ? 'scale-105' : 'animate-slideUp'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success overlay */}
        {success && (
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex flex-col items-center justify-center z-20 animate-fadeIn">
            <div className="relative">
              <CheckCircle className="w-20 h-20 text-white animate-bounce" />
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-300 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-white mt-4">Замовлення прийнято!</h3>
            <p className="text-white/90 mt-2">Ми зателефонуємо вам найближчим часом</p>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 p-1 hover:bg-gray-100 rounded-full"
          data-testid="quick-order-close-btn"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Купити швидко</h2>
              <p className="text-sm text-gray-500">Залиште дані — ми зателефонуємо</p>
            </div>
          </div>

          {/* Product info */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg shadow-md"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm line-clamp-2">{product.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-green-600 font-bold text-lg">{product.price?.toLocaleString()} ₴</span>
                {quantity > 1 && (
                  <span className="text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">× {quantity}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ваше ім'я <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Як до вас звертатися?"
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                data-testid="quick-order-name-input"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Номер телефону <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                placeholder="+380 XX XXX XX XX"
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                data-testid="quick-order-phone-input"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Коментар <span className="text-gray-400 font-normal">(необов'язково)</span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Ваші побажання..."
              rows="2"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all bg-gray-50 hover:bg-white"
              data-testid="quick-order-notes-input"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 active:scale-[0.98]"
            data-testid="quick-order-submit-btn"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Оформлення...
              </span>
            ) : (
              '⚡ Замовити зараз'
            )}
          </button>

          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Натискаючи кнопку, ви погоджуєтесь на обробку персональних даних
          </p>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default QuickOrderModal;
