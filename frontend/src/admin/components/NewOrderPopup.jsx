import React from 'react';
import { ShoppingCart, X, User, Phone, Package, DollarSign, Bell } from 'lucide-react';

const NewOrderPopup = ({ order, isVisible, onClose }) => {
  if (!isVisible || !order) return null;

  return (
    <>
      {/* Overlay backdrop */}
      <div 
        className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className="fixed top-6 right-6 z-[9999] animate-slideInRight">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d1520] to-[#1a2636] border border-emerald-500/30 shadow-2xl shadow-emerald-500/20 w-96 max-w-[calc(100vw-3rem)]">
          {/* Glow effect */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-green-500/15 blur-2xl" />
          
          {/* Header */}
          <div className="relative p-4 border-b border-white/10 bg-gradient-to-r from-emerald-600/20 to-green-600/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/40">
                    <Bell className="w-5 h-5 text-white animate-bounce" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Нове замовлення!</h3>
                  <p className="text-emerald-400 text-sm font-medium">#{order.id?.substring(0, 8)}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
                data-testid="close-new-order-popup"
              >
                <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="relative p-4 space-y-3">
            {/* Customer */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/20">
                <User className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Клієнт</p>
                <p className="font-semibold text-white truncate">{order.customerName || 'Без імені'}</p>
              </div>
            </div>
            
            {/* Phone */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/20">
                <Phone className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Телефон</p>
                <p className="font-semibold text-white">{order.customerPhone || '-'}</p>
              </div>
            </div>
            
            {/* Items count */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/20">
                <Package className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Товарів</p>
                <p className="font-semibold text-white">{order.items?.length || 0} шт</p>
              </div>
            </div>
            
            {/* Total */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-green-500/10 border border-emerald-500/30">
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-emerald-400">Сума замовлення</p>
                <p className="font-black text-2xl text-white">{(order.totalAmount || 0).toLocaleString('uk-UA')} ₴</p>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="relative p-4 border-t border-white/10 bg-white/[0.02]">
            <a
              href="/admin/orders"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5"
              data-testid="view-orders-btn"
            >
              <ShoppingCart className="w-5 h-5" />
              Переглянути замовлення
            </a>
          </div>
          
          {/* Animated border shine */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none">
            <div className="absolute inset-0 rounded-2xl border border-emerald-400/50 animate-pulse" />
          </div>
        </div>
      </div>
      
      {/* CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
};

export default NewOrderPopup;
