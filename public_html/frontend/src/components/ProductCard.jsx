import React, { useMemo, useRef, useState } from 'react';
import { ShoppingCart, Heart, Zap, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import QuickOrderModal from './QuickOrderModal';
import { toast } from './CustomToast';
import { getImageUrl } from '../utils/imageUrl';

const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
};

// ✅ Fly-to-cart animation (image -> cart icon)
const flyToCart = (imgEl) => {
  if (!imgEl) return;
  const cartIcon = document.querySelector('[data-testid="cart-icon"]');
  if (!cartIcon) return;

  const reduce = prefersReducedMotion();

  const imgRect = imgEl.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();

  const clone = imgEl.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.left = `${imgRect.left}px`;
  clone.style.top = `${imgRect.top}px`;
  clone.style.width = `${imgRect.width}px`;
  clone.style.height = `${imgRect.height}px`;
  clone.style.zIndex = '9999';
  clone.style.pointerEvents = 'none';
  clone.style.borderRadius = '14px';
  clone.style.objectFit = 'cover';
  clone.style.boxShadow = '0 18px 48px rgba(0,0,0,.25)';
  clone.style.willChange = 'transform, opacity';
  document.body.appendChild(clone);

  const endX = cartRect.left + cartRect.width / 2 - imgRect.left - imgRect.width / 2;
  const endY = cartRect.top + cartRect.height / 2 - imgRect.top - imgRect.height / 2;

  if (!reduce && clone.animate) {
    clone.animate(
      [
        { transform: 'translate3d(0,0,0) scale(1)', opacity: 1, filter: 'blur(0px)' },
        { transform: `translate3d(${endX * 0.55}px, ${endY * 0.6}px, 0) scale(.9)`, opacity: 0.9 },
        { transform: `translate3d(${endX}px, ${endY}px, 0) scale(.25)`, opacity: 0.15, filter: 'blur(0.2px)' },
      ],
      { duration: 720, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' }
    );

    setTimeout(() => {
      clone.remove();
      cartIcon.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.22)' },
          { transform: 'scale(0.98)' },
          { transform: 'scale(1)' },
        ],
        { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' }
      );
    }, 760);

    return;
  }

  setTimeout(() => clone.remove(), 350);
};

// ✅ Wishlist burst particles
const burstHearts = (anchorEl) => {
  if (!anchorEl) return;
  const reduce = prefersReducedMotion();
  if (reduce) return;

  const rect = anchorEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const count = 8;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.textContent = '❤';
    p.style.position = 'fixed';
    p.style.left = `${cx}px`;
    p.style.top = `${cy}px`;
    p.style.transform = 'translate(-50%, -50%)';
    p.style.zIndex = '9999';
    p.style.pointerEvents = 'none';
    p.style.fontSize = '14px';
    p.style.opacity = '0.95';
    p.style.filter = 'drop-shadow(0 8px 10px rgba(0,0,0,.18))';
    document.body.appendChild(p);

    const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.4 - 0.2);
    const dist = 26 + Math.random() * 18;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - (10 + Math.random() * 8);

    p.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0.8)', opacity: 0.95 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1.15)`, opacity: 0.85 },
        { transform: `translate(calc(-50% + ${dx * 1.15}px), calc(-50% + ${dy * 1.3}px)) scale(0.6)`, opacity: 0 },
      ],
      { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' }
    );

    setTimeout(() => p.remove(), 560);
  }
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, loading: cartLoading } = useCart();
  const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();

  const [showQuickOrder, setShowQuickOrder] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const imgRef = useRef(null);
  const wishBtnRef = useRef(null);

  const isFavorite = isInWishlist(product.id);

  const hasSale = product.badges?.includes('sale');
  const isNew = product.badges?.includes('new');
  const isHit = product.badges?.includes('hit');

  const canBuy = product.stock > 0 && !cartLoading && !addedToCart;

  const badgeEls = useMemo(() => {
    const list = [];
    if (isNew) list.push({ key: 'new', text: 'НОВИНКА', cls: 'from-green-500 to-emerald-500 shadow-green-500/30' });
    if (isHit) list.push({ key: 'hit', text: 'ХІТ', cls: 'from-amber-400 to-orange-500 shadow-orange-500/30' });
    if (hasSale) list.push({ key: 'sale', text: 'РОЗПРОДАЖ', cls: 'from-red-500 to-rose-500 shadow-red-500/30' });
    return list;
  }, [hasSale, isHit, isNew]);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!canBuy) return;

    flyToCart(imgRef.current);

    await addToCart(product, 1, { silent: true });

    setAddedToCart(true);
    toast.cartAdd(product.name);

    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (wishlistLoading) return;

    const wasInWishlist = isFavorite;

    const btn = wishBtnRef.current || e.currentTarget;
    if (!prefersReducedMotion() && btn?.animate) {
      btn.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.22)' },
          { transform: 'scale(0.96)' },
          { transform: 'scale(1)' },
        ],
        { duration: 260, easing: 'cubic-bezier(.16,1,.3,1)' }
      );
    }

    if (!wasInWishlist) burstHearts(btn);

    await toggleWishlist(product.id, product.name);
  };

  return (
    <>
      {/* ✅ local keyframes for button shine + subtle glow */}
      <style>{`
        @keyframes ps_shine {
          0% { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
          15% { opacity: .55; }
          55% { opacity: .55; }
          100% { transform: translateX(220%) skewX(-18deg); opacity: 0; }
        }
        @keyframes ps_breathGlow {
          0%,100% { filter: drop-shadow(0 0 0 rgba(16,185,129,0)); transform: translateZ(0) scale(1); }
          50% { filter: drop-shadow(0 12px 20px rgba(16,185,129,.22)); transform: translateZ(0) scale(1.01); }
        }
      `}</style>

      <div
        className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 relative h-full flex flex-col cursor-pointer card-appear"
        onClick={() => navigate(`/products/${product.id}`)}
        data-testid={`product-card-${product.id}`}
      >
        <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 flex flex-col gap-1">
            {badgeEls.map((b) => (
              <span
                key={b.key}
                className={`bg-gradient-to-r ${b.cls} text-white text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-bold shadow-lg`}
              >
                {b.text}
              </span>
            ))}
          </div>

          {product.discount > 0 && (
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 discount-badge">
              <div className="bg-red-500 text-white text-[10px] sm:text-sm font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-lg">
                -{product.discount}%
              </div>
            </div>
          )}

          <img
            ref={imgRef}
            src={getImageUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            draggable={false}
          />

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <button
                ref={wishBtnRef}
                onClick={handleWishlist}
                disabled={wishlistLoading}
                className={`p-3 rounded-full shadow-lg backdrop-blur-sm transition-all active:scale-[0.98] ${
                  isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
                }`}
                aria-label="Додати в бажання"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          <button
            ref={wishBtnRef}
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className={`absolute top-1.5 right-1.5 sm:hidden z-10 p-1.5 rounded-full shadow-md backdrop-blur-sm transition-all active:scale-[0.98] ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white/95 text-gray-500'
            } ${product.discount > 0 ? 'top-8' : ''}`}
            aria-label="Додати в бажання"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="p-2 sm:p-4 flex-1 flex flex-col">
          <span className="text-[9px] sm:text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5 sm:mb-1 truncate">
            {product.category}
          </span>

          <h3 className="text-xs sm:text-base font-semibold text-gray-800 line-clamp-2 mb-1 sm:mb-2 group-hover:text-green-600 transition-colors min-h-[2rem] sm:min-h-[3rem]">
            {product.name}
          </h3>

          <div className="mt-auto">
            <div className="flex items-baseline gap-1 sm:gap-2 mb-1.5 sm:mb-3">
              <span className="text-base sm:text-2xl font-bold text-gray-900">{product.price?.toLocaleString()}</span>
              <span className="text-sm sm:text-lg text-gray-900">₴</span>
              {product.oldPrice && (
                <span className="text-[10px] sm:text-sm text-gray-400 line-through">
                  {product.oldPrice?.toLocaleString()} ₴
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 mb-1.5 sm:mb-3">
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-[10px] sm:text-xs font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? 'В наявності' : 'Немає'}
              </span>
            </div>

            <div className="flex gap-1.5 sm:gap-2">
              {/* ✅ BUY BUTTON with shine */}
              <button
                onClick={handleAddToCart}
                disabled={cartLoading || product.stock === 0 || addedToCart}
                className={`relative overflow-hidden flex-1 py-2 sm:py-3 px-2 sm:px-3 rounded-lg sm:rounded-xl font-semibold text-[11px] sm:text-sm transition-all flex items-center justify-center gap-1 sm:gap-2 ${
                  addedToCart
                    ? 'bg-green-500 text-white'
                    : product.stock === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/30 hover:shadow-lg hover:shadow-green-500/40 active:scale-[0.98]'
                }`}
                style={
                  !addedToCart && product.stock > 0 && !prefersReducedMotion()
                    ? { animation: 'ps_breathGlow 2.9s ease-in-out infinite' }
                    : undefined
                }
                data-testid={`add-to-cart-${product.id}`}
              >
                {/* shine overlay (only when active) */}
                {!addedToCart && product.stock > 0 && (
                  <span
                    className="pointer-events-none absolute inset-0"
                    aria-hidden="true"
                  >
                    <span
                      className="absolute inset-y-0 left-0 w-1/3 bg-white/35 blur-[1px]"
                      style={{
                        transform: 'translateX(-120%) skewX(-18deg)',
                        animation: prefersReducedMotion() ? 'none' : 'ps_shine 2.6s ease-in-out infinite',
                      }}
                    />
                    {/* subtle highlight */}
                    <span className="absolute inset-0 bg-gradient-to-t from-black/0 via-white/0 to-white/10 opacity-80" />
                  </span>
                )}

                {addedToCart ? (
                  <>
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Додано</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Купити</span>
                  </>
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuickOrder(true);
                }}
                disabled={product.stock === 0}
                className="p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 border-green-500 text-green-600 hover:bg-green-50 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                title="Швидке замовлення"
                data-testid={`quick-order-${product.id}`}
              >
                <Zap className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showQuickOrder && <QuickOrderModal product={product} isOpen={showQuickOrder} onClose={() => setShowQuickOrder(false)} />}
    </>
  );
};

export default ProductCard;
