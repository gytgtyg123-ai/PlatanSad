import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckSquare, Square, Check } from 'lucide-react';
import { toast } from 'sonner';
import { getImageUrl } from '../utils/imageUrl';

/* ===== Anim helpers (fly + slide-out) ===== */
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
};

const flyBetween = (startEl, targetEl, opts = {}) => {
  if (!startEl || !targetEl) return;
  const reduce = prefersReducedMotion();

  const duration = opts.duration ?? 560;
  const easing = opts.easing ?? 'cubic-bezier(.16,1,.3,1)';
  const scaleEnd = opts.scaleEnd ?? 0.12;

  const startRect = startEl.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();

  const clone = startEl.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.left = `${startRect.left}px`;
  clone.style.top = `${startRect.top}px`;
  clone.style.width = `${startRect.width}px`;
  clone.style.height = `${startRect.height}px`;
  clone.style.zIndex = '9999';
  clone.style.pointerEvents = 'none';
  clone.style.borderRadius = opts.borderRadius ?? '14px';
  clone.style.objectFit = 'cover';
  clone.style.boxShadow = opts.shadow ?? '0 14px 36px rgba(0,0,0,.22)';
  clone.style.willChange = 'transform, opacity, filter';
  document.body.appendChild(clone);

  const endX =
    targetRect.left + targetRect.width / 2 - startRect.left - startRect.width / 2;
  const endY =
    targetRect.top + targetRect.height / 2 - startRect.top - startRect.height / 2;

  const cleanup = () => clone.remove();

  if (!reduce && clone.animate) {
    clone.animate(
      [
        { transform: 'translate3d(0,0,0) scale(1)', opacity: 1, filter: 'blur(0px)' },
        { transform: `translate3d(${endX * 0.55}px, ${endY * 0.6}px, 0) scale(.9)`, opacity: 0.9 },
        { transform: `translate3d(${endX}px, ${endY}px, 0) scale(${scaleEnd})`, opacity: 0.12, filter: 'blur(0.2px)' },
      ],
      { duration, easing, fill: 'forwards' }
    );
    window.setTimeout(cleanup, duration + 40);
    return;
  }

  window.setTimeout(cleanup, 300);
};

const flyRemoveFromCart = (imgEl) => {
  const cartIcon = document.querySelector('[data-testid="cart-icon"]');
  if (!cartIcon) return;

  flyBetween(imgEl, cartIcon, { duration: 560, scaleEnd: 0.12 });

  if (!prefersReducedMotion() && cartIcon?.animate) {
    cartIcon.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.16)' }, { transform: 'scale(0.98)' }, { transform: 'scale(1)' }],
      { duration: 260, easing: 'cubic-bezier(.16,1,.3,1)' }
    );
  }
};

const animateSlideOut = (cardEl) =>
  new Promise((resolve) => {
    if (!cardEl) return resolve();
    if (prefersReducedMotion() || !cardEl.animate) return resolve();

    const h = cardEl.offsetHeight;
    const a = cardEl.animate(
      [
        { transform: 'translateX(0)', opacity: 1, height: `${h}px` },
        { transform: 'translateX(14px)', opacity: 0.65, height: `${h}px` },
        { transform: 'translateX(46px)', opacity: 0, height: '0px', marginBottom: '0px' },
      ],
      { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' }
    );
    a.onfinish = () => resolve();
  });
/* ===== /Anim helpers ===== */

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, cartCount, loading, addToCart } = useCart();

  const [selectedItems, setSelectedItems] = useState(new Set());

  const imgRefs = useRef(new Map());
  const cardRefs = useRef(new Map());
  const [removingIds, setRemovingIds] = useState(() => new Set());

  // ✅ Better selection sync:
  // - keep user's selection
  // - auto-add newly появлені items
  // - remove ids that disappeared
  useEffect(() => {
    setSelectedItems((prev) => {
      const next = new Set(prev);

      // Remove ids that no longer exist
      const idsNow = new Set(cartItems.map((i) => i.id));
      for (const id of next) {
        if (!idsNow.has(id)) next.delete(id);
      }

      // Auto-add new items (only if prev was "all selected" OR prev empty)
      // This avoids unexpectedly selecting when user intentionally deselected.
      if (prev.size === 0 || prev.size === cartItems.length - 1) {
        cartItems.forEach((item) => next.add(item.id));
      }

      // If cart has items and prev was empty (first load), select all.
      if (prev.size === 0 && cartItems.length > 0) {
        cartItems.forEach((item) => next.add(item.id));
      }

      return next;
    });
  }, [cartItems]);

  const toggleSelection = (id) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (cartItems.length === 0) return;
    setSelectedItems((prev) => {
      if (prev.size === cartItems.length) return new Set();
      const next = new Set();
      cartItems.forEach((item) => next.add(item.id));
      return next;
    });
  };

  const selectedTotal = cartItems
    .filter(item => selectedItems.has(item.id))
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const selectedCount = selectedItems.size;

  const handleCheckout = () => {
    if (selectedCount === 0) {
      toast.error('Виберіть хоча б один товар для замовлення');
      return;
    }
    navigate('/checkout');
  };

  const handleRemoveAnimated = async (item) => {
    if (removingIds.has(item.id)) return;

    setRemovingIds(prev => {
      const s = new Set(prev);
      s.add(item.id);
      return s;
    });

    // Prepare Undo payload BEFORE removal
    const undoProduct = {
      id: item.productId, // IMPORTANT: CartContext expects product.id
      name: item.productName,
      image: item.productImage,
      price: item.price,
    };
    const undoQty = item.quantity;

    const imgEl = imgRefs.current.get(item.id);
    const cardEl = cardRefs.current.get(item.id);

    // Animations
    flyRemoveFromCart(imgEl);
    await animateSlideOut(cardEl);

    // Real remove (silent to avoid double toasts)
    await removeFromCart(item.id, item.productName, { silent: true });

    // Custom toast with Undo
    toast.custom((t) => (
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-4 text-white min-w-[320px] shadow-2xl shadow-black/40">
        <div className="flex items-start gap-3">
          <div className="bg-white/15 p-2.5 rounded-xl mt-0.5">
            <Trash2 className="w-6 h-6" />
          </div>

          <div className="flex-1">
            <p className="font-bold text-lg">Видалено з кошика</p>
            <p className="text-sm text-white/80 mt-0.5">{item.productName}</p>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/20 transition text-sm font-semibold"
                onClick={async () => {
                  try {
                    await addToCart(undoProduct, undoQty, { silent: true });
                    toast.custom(() => (
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 text-white min-w-[280px] shadow-2xl shadow-green-500/40">
                        <div className="flex items-center gap-3">
                          <div className="bg-white/20 p-2.5 rounded-xl">
                            <Check className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-lg">Повернуто ✅</p>
                            <p className="text-sm text-white/90 mt-0.5">{undoProduct.name}</p>
                          </div>
                        </div>
                      </div>
                    ), { duration: 1800, position: 'top-center' });
                  } finally {
                    toast.dismiss(t);
                  }
                }}
              >
                Повернути
              </button>

              <button
                type="button"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 transition text-sm"
                onClick={() => toast.dismiss(t)}
              >
                Ок
              </button>
            </div>
          </div>
        </div>
      </div>
    ), { duration: 4500, position: 'top-center' });

    setRemovingIds(prev => {
      const s = new Set(prev);
      s.delete(item.id);
      return s;
    });
  };

  // ✅ Empty cart
  if (cartItems.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-8 sm:py-10 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center">
              Кошик
            </h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          <div className="bg-white rounded-2xl shadow-sm md:shadow-lg p-6 sm:p-10 text-center max-w-xl mx-auto">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-green-500" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-2">
              Кошик порожній <span className="ml-1">🛒</span>
            </h2>

            <p className="text-gray-500 text-sm sm:text-base mb-8">
              Ви ще нічого не додали до кошика. Перегляньте наш каталог — там багато цікавого! 🌿
            </p>

            <button
              type="button"
              onClick={() => navigate('/catalog')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Перейти до каталогу
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32 md:pb-12 pt-4 md:pt-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          Кошик
          <span className="text-lg font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {cartCount}
          </span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Cart Items List */}
          <div className="flex-1 space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <button
                type="button"
                onClick={toggleAll}
                className="flex items-center gap-3 text-gray-600 font-medium hover:text-green-600 transition-colors"
              >
                {selectedItems.size === cartItems.length ? (
                  <CheckSquare className="w-6 h-6 text-green-600" />
                ) : (
                  <Square className="w-6 h-6 text-gray-300" />
                )}
                <span>Вибрати всі ({cartItems.length})</span>
              </button>
            </div>

            {cartItems.map((item) => (
              <div
                key={item.id}
                ref={(el) => {
                  if (el) cardRefs.current.set(item.id, el);
                  else cardRefs.current.delete(item.id);
                }}
                className={`bg-white rounded-xl p-4 shadow-sm border transition-all duration-200 ${
                  selectedItems.has(item.id) ? 'border-green-200 bg-green-50/10' : 'border-gray-100'
                }`}
              >
                <div className="flex gap-4">
                  {/* Checkbox */}
                  <div className="flex items-center justify-center pt-8 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => toggleSelection(item.id)}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={removingIds.has(item.id)}
                    >
                      {selectedItems.has(item.id) ? (
                        <CheckSquare className="w-6 h-6 text-green-600" />
                      ) : (
                        <Square className="w-6 h-6 text-gray-300" />
                      )}
                    </button>
                  </div>

                  {/* Image */}
                  <div
                    className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() => navigate(`/products/${item.productId}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <img
                      ref={(el) => {
                        if (el) imgRefs.current.set(item.id, el);
                        else imgRefs.current.delete(item.id);
                      }}
                      src={getImageUrl(item.productImage)}
                      alt={item.productName}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3
                          className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2 hover:text-green-600 cursor-pointer transition-colors"
                          onClick={() => navigate(`/products/${item.productId}`)}
                          role="button"
                          tabIndex={0}
                        >
                          {item.productName}
                        </h3>

                        <button
                          type="button"
                          onClick={() => handleRemoveAnimated(item)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 disabled:opacity-40"
                          aria-label="Видалити"
                          disabled={removingIds.has(item.id)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="mt-1 sm:mt-2 text-lg font-bold text-gray-900">
                        {item.price} ₴
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-3">
                      {/* Qty Controls */}
                      <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={loading || item.quantity <= 1 || removingIds.has(item.id)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white rounded-md transition-colors disabled:opacity-30"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <span className="w-10 text-center font-medium text-sm">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={loading || removingIds.has(item.id)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white rounded-md transition-colors disabled:opacity-30"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="font-bold text-green-600 text-sm sm:text-base">
                        {(item.price * item.quantity).toFixed(0)} ₴
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-96 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24 hidden lg:block">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Разом</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Вибрано товарів</span>
                  <span className="font-medium">{selectedCount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Доставка</span>
                  <span className="text-green-600 text-sm font-medium">За тарифами пошти</span>
                </div>
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">До сплати</span>
                  <span className="text-2xl font-bold text-green-600">{selectedTotal.toFixed(0)} ₴</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={selectedCount === 0}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                <span>Оформити замовлення</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <Check className="w-4 h-4 text-green-500" />
                <span>Безпечна оплата</span>
              </div>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 p-4 shadow-2xl lg:hidden z-40 safe-area-pb">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-500">До сплати ({selectedCount})</div>
                  <div className="text-2xl font-bold text-green-600 leading-tight">
                    {selectedTotal.toFixed(0)} ₴
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={selectedCount === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
                >
                  <span>Оформити</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
