import React from 'react';
import { toast as sonnerToast } from 'sonner';
import { 
  ShoppingCart, Check, Sparkles, PartyPopper, Rocket, 
  Heart, Package, AlertCircle, Info, Trash2, RefreshCw,
  CreditCard, Truck, Star, Gift, Bell
} from 'lucide-react';

// Кастомні анімовані toast повідомлення
const CustomToast = ({ icon: Icon, title, description, variant = 'success', showConfetti = false }) => {
  const variants = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500',
      iconBg: 'bg-white/25',
      glow: 'shadow-[0_8px_32px_rgba(34,197,94,0.4)]',
      ring: 'ring-2 ring-green-400/30',
    },
    cart: {
      bg: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500',
      iconBg: 'bg-white/25',
      glow: 'shadow-[0_8px_32px_rgba(99,102,241,0.4)]',
      ring: 'ring-2 ring-blue-400/30',
    },
    order: {
      bg: 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500',
      iconBg: 'bg-white/25',
      glow: 'shadow-[0_8px_32px_rgba(168,85,247,0.4)]',
      ring: 'ring-2 ring-purple-400/30',
    },
    wishlist: {
      bg: 'bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500',
      iconBg: 'bg-white/25',
      glow: 'shadow-[0_8px_32px_rgba(236,72,153,0.4)]',
      ring: 'ring-2 ring-rose-400/30',
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 via-rose-500 to-orange-500',
      iconBg: 'bg-white/25',
      glow: 'shadow-[0_8px_32px_rgba(239,68,68,0.4)]',
      ring: 'ring-2 ring-red-400/30',
    },
    info: {
      bg: 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500',
      iconBg: 'bg-white/25',
      glow: 'shadow-[0_8px_32px_rgba(6,182,212,0.4)]',
      ring: 'ring-2 ring-cyan-400/30',
    },
    warning: {
      bg: 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500',
      iconBg: 'bg-white/25',
      glow: 'shadow-[0_8px_32px_rgba(245,158,11,0.4)]',
      ring: 'ring-2 ring-amber-400/30',
    },
  };

  const v = variants[variant] || variants.success;

  return (
    <div 
      className={`
        ${v.bg} ${v.glow} ${v.ring}
        relative overflow-hidden
        rounded-2xl p-4 text-white min-w-[300px] max-w-[380px]
        animate-toast-pop
        backdrop-blur-sm
      `}
    >
      {/* Background shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-shine pointer-events-none" />
      
      <div className="flex items-center gap-4 relative z-10">
        {/* Animated Icon with pulse ring */}
        <div className="relative">
          <div className={`${v.iconBg} p-3 rounded-xl animate-toast-bounce backdrop-blur-sm`}>
            <Icon className="w-6 h-6 animate-toast-sparkle" strokeWidth={2.5} />
          </div>
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse-ring" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-base leading-tight drop-shadow-sm">{title}</p>
          {description && (
            <p className="text-sm text-white/85 mt-1 truncate">{description}</p>
          )}
        </div>

        {/* Sparkles decoration */}
        <div className="absolute -top-1 -right-1 animate-toast-sparkle">
          <Sparkles className="w-5 h-5 text-yellow-200 drop-shadow-lg" />
        </div>
      </div>

      {/* Animated floating particles */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <div className="absolute top-2 left-6 w-1.5 h-1.5 bg-white/50 rounded-full animate-float-1" />
        <div className="absolute top-5 right-10 w-2 h-2 bg-white/40 rounded-full animate-float-2" />
        <div className="absolute bottom-4 left-10 w-1 h-1 bg-white/60 rounded-full animate-float-3" />
        <div className="absolute bottom-3 right-6 w-1.5 h-1.5 bg-white/45 rounded-full animate-float-1" />
        <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-white/30 rounded-full animate-float-2" />
      </div>

      {/* Confetti effect for special toasts */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-sm"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: '100%',
                backgroundColor: ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'][i % 6],
                animation: `confetti 1s ease-out ${i * 0.1}s forwards`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Bottom progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden rounded-b-2xl">
        <div className="h-full bg-white/40 animate-progress-shrink" />
      </div>
    </div>
  );
};

// Toast functions with different animations
export const toast = {
  // Додано в кошик
  cartAdd: (productName) => {
    sonnerToast.custom(() => (
      <CustomToast
        icon={ShoppingCart}
        title="Додано в кошик! 🛒"
        description={productName}
        variant="cart"
      />
    ), {
      duration: 3000,
      position: 'top-center',
    });
  },

  // Успішне замовлення
  orderSuccess: () => {
    sonnerToast.custom(() => (
      <CustomToast
        icon={PartyPopper}
        title="Замовлення оформлено! 🎉"
        description="Очікуйте дзвінок менеджера"
        variant="order"
        showConfetti={true}
      />
    ), {
      duration: 5000,
      position: 'top-center',
    });
  },

  // Перенаправлення на оплату
  paymentRedirect: () => {
    sonnerToast.custom(() => (
      <CustomToast
        icon={CreditCard}
        title="Переходимо до оплати! 💳"
        description="Зачекайте..."
        variant="order"
      />
    ), {
      duration: 3000,
      position: 'top-center',
    });
  },

  // Додано в список бажань
  wishlistAdd: (productName) => {
    sonnerToast.custom(() => (
      <CustomToast
        icon={Heart}
        title="Додано в бажання! ❤️"
        description={productName}
        variant="wishlist"
      />
    ), {
      duration: 3000,
      position: 'top-center',
    });
  },

  // Видалено з бажань
  wishlistRemove: () => {
    sonnerToast.custom(() => (
      <CustomToast
        icon={Heart}
        title="Видалено з бажань"
        variant="wishlist"
      />
    ), {
      duration: 2000,
      position: 'top-center',
    });
  },

  // Успіх загальний
  success: (title, description) => {
    sonnerToast.custom(() => (
      <CustomToast
        icon={Check}
        title={title}
        description={description}
        variant="success"
      />
    ), {
      duration: 3000,
      position: 'top-center',
    });
  },

  // Швидке замовлення
  quickOrder: () => {
    sonnerToast.custom(() => (
      <CustomToast
        icon={Rocket}
        title="Швидке замовлення! ⚡"
        description="Ми зателефонуємо вам"
        variant="order"
        showConfetti={true}
      />
    ), {
      duration: 4000,
      position: 'top-center',
    });
  },

  // Видалено з кошика
  cartRemove: (productName) => {
    sonnerToast.custom(() => (
      <CustomToast
        icon={Trash2}
        title="Видалено з кошика"
        description={productName}
        variant="warning"
      />
    ), {
      duration: 2500,
      position: 'top-center',
    });
  },

  // Оновлено кількість
  cartUpdate: () => {
    sonnerToast.custom(() => (
      <CustomToast
        icon={RefreshCw}
        title="Кількість оновлено"
        variant="info"
      />
    ), {
      duration: 2000,
      position: 'top-center',
    });
  },

  // Інформаційне повідомлення
  info: (title, description) => {
    sonnerToast.custom(() => (
      <CustomToast
        icon={Info}
        title={title}
        description={description}
        variant="info"
      />
    ), {
      duration: 3000,
      position: 'top-center',
    });
  },

  // Попередження
  warning: (title, description) => {
    sonnerToast.custom(() => (
      <CustomToast
        icon={AlertCircle}
        title={title}
        description={description}
        variant="warning"
      />
    ), {
      duration: 4000,
      position: 'top-center',
    });
  },

  // Помилка
  error: (message, description) => {
    sonnerToast.custom(() => (
      <CustomToast
        icon={AlertCircle}
        title={message}
        description={description}
        variant="error"
      />
    ), {
      duration: 4000,
      position: 'top-center',
    });
  },

  // Доставка
  delivery: (message) => {
    sonnerToast.custom(() => (
      <CustomToast
        icon={Truck}
        title="Доставка 🚚"
        description={message}
        variant="info"
      />
    ), {
      duration: 3000,
      position: 'top-center',
    });
  },

  // Подарунок/промо
  promo: (title, description) => {
    sonnerToast.custom(() => (
      <CustomToast
        icon={Gift}
        title={title}
        description={description}
        variant="order"
        showConfetti={true}
      />
    ), {
      duration: 5000,
      position: 'top-center',
    });
  },

  // Сповіщення
  notification: (title, description) => {
    sonnerToast.custom(() => (
      <CustomToast
        icon={Bell}
        title={title}
        description={description}
        variant="info"
      />
    ), {
      duration: 4000,
      position: 'top-center',
    });
  },
};

export default toast;
