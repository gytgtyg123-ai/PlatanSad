// WishlistPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { productsApi } from '../api/productsApi';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { getImageUrl } from '../utils/imageUrl';

/* ===== Anim helpers (fly to cart + broken hearts + slide-out) ===== */
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
};

const flyBetween = (startEl, targetEl, opts = {}) => {
  if (!startEl || !targetEl) return;
  const reduce = prefersReducedMotion();

  const duration = opts.duration ?? 720;
  const easing = opts.easing ?? 'cubic-bezier(.16,1,.3,1)';
  const scaleEnd = opts.scaleEnd ?? 0.25;

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
  clone.style.boxShadow = opts.shadow ?? '0 18px 48px rgba(0,0,0,.25)';
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

const flyToCart = (imgEl) => {
  const cartIcon = document.querySelector('[data-testid="cart-icon"]');
  if (!cartIcon) return;

  flyBetween(imgEl, cartIcon, { duration: 720, scaleEnd: 0.25 });

  if (!prefersReducedMotion() && cartIcon?.animate) {
    cartIcon.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.22)' }, { transform: 'scale(0.98)' }, { transform: 'scale(1)' }],
      { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' }
    );
  }
};

const burstBrokenHearts = (anchorEl) => {
  if (!anchorEl || prefersReducedMotion()) return;

  const rect = anchorEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const count = 7;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.textContent = '💔';
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

    const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.5 - 0.25);
    const dist = 22 + Math.random() * 14;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - (6 + Math.random() * 10);

    p.animate(
      [
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.95 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1.08)`, opacity: 0.75 },
        { transform: `translate(calc(-50% + ${dx * 1.15}px), calc(-50% + ${dy * 1.35}px)) scale(0.5)`, opacity: 0 },
      ],
      { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' }
    );

    setTimeout(() => p.remove(), 560);
  }
};

const animateSlideOut = (cardEl) =>
  new Promise((resolve) => {
    if (!cardEl) return resolve();
    if (prefersReducedMotion() || !cardEl.animate) return resolve();

    const h = cardEl.offsetHeight;
    const a = cardEl.animate(
      [
        { transform: 'translateY(0)', opacity: 1, height: `${h}px` },
        { transform: 'translateY(10px)', opacity: 0.65, height: `${h}px` },
        { transform: 'translateY(26px)', opacity: 0, height: '0px', marginBottom: '0px' },
      ],
      { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' }
    );
    a.onfinish = () => resolve();
  });
/* ===== /Anim helpers ===== */

const WishlistPage = () => {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const imgRefs = useRef(new Map());
  const cardRefs = useRef(new Map());
  const [removingIds, setRemovingIds] = useState(() => new Set());

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productPromises = wishlistItems.map((item) => productsApi.getProduct(item.productId));
        const productsData = await Promise.all(productPromises);
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching wishlist products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (wishlistItems.length > 0) fetchProducts();
    else {
      setProducts([]); // ✅ одразу чистимо, щоб пустий стан зʼявився миттєво
      setLoading(false);
    }
  }, [wishlistItems]);

  const handleAddToCart = async (product, e) => {
    e?.stopPropagation?.();

    const imgEl = imgRefs.current.get(product.id);
    flyToCart(imgEl);

    await addToCart(product, 1);

    toast.custom(() => (
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 text-white min-w-[280px] shadow-2xl shadow-green-500/40">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-xl">
            <ShoppingCart className="w-6 h-6 fill-current" />
          </div>
          <div>
            <p className="font-bold text-lg">Додано в кошик! 🛒</p>
            <p className="text-sm text-white/90 mt-0.5">{product.name}</p>
          </div>
        </div>
      </div>
    ), { duration: 2200, position: 'top-center' });
  };

  const handleRemoveWish = async (product, e) => {
    e?.stopPropagation?.();
    if (removingIds.has(product.id)) return;

    setRemovingIds((prev) => {
      const s = new Set(prev);
      s.add(product.id);
      return s;
    });

    const btn = e?.currentTarget;
    burstBrokenHearts(btn);

    // ✅ ГОЛОВНЕ: прибираємо з UI одразу (щоб лічильник і список стали 0 миттєво)
    setProducts((prev) => prev.filter((p) => p.id !== product.id));

    const cardEl = cardRefs.current.get(product.id);
    await animateSlideOut(cardEl);

    await removeFromWishlist(product.id);

    toast.custom(() => (
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-4 text-white min-w-[280px] shadow-2xl shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="bg-white/15 p-2.5 rounded-xl">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-lg">Видалено з бажань 💔</p>
            <p className="text-sm text-white/80 mt-0.5">{product.name}</p>
          </div>
        </div>
      </div>
    ), { duration: 2200, position: 'top-center' });

    setRemovingIds((prev) => {
      const s = new Set(prev);
      s.delete(product.id);
      return s;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Завантаження...</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
            <Heart className="w-20 h-20 sm:w-24 sm:h-24 mx-auto text-gray-300 mb-4 sm:mb-6" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
              Список бажань порожній
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
              Додайте товари до списку бажань, щоб не забути про них
            </p>
            <button
              onClick={() => navigate('/catalog')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3.5 sm:py-3 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95"
            >
              Перейти до каталогу
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8" data-testid="wishlist-title">
          Список бажань{' '}
          <span className="text-gray-500 font-normal text-lg sm:text-2xl">
            ({products.length} {products.length === 1 ? 'товар' : 'товарів'})
          </span>
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              ref={(el) => {
                if (el) cardRefs.current.set(product.id, el);
                else cardRefs.current.delete(product.id);
              }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all"
              data-testid={`wishlist-item-${product.id}`}
            >
              <div
                className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <img
                  ref={(el) => {
                    if (el) imgRefs.current.set(product.id, el);
                    else imgRefs.current.delete(product.id);
                  }}
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform"
                  loading="lazy"
                />

                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.badges?.includes('sale') && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                      Розпродаж
                    </span>
                  )}
                  {product.badges?.includes('new') && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded font-medium">
                      Новинка
                    </span>
                  )}
                  {product.badges?.includes('hit') && (
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded font-medium">
                      Хіт
                    </span>
                  )}
                </div>

                {product.discount > 0 && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-red-600 text-white text-sm px-2 py-1 rounded-full font-bold">
                      −{product.discount}%
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="text-xs text-gray-500 mb-2">Артикул: {product.article}</div>
                <h3
                  className="text-sm font-medium text-gray-800 mb-3 h-12 line-clamp-2 hover:text-green-600 cursor-pointer transition-colors"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  {product.name}
                </h3>

                <div className="flex items-center gap-2 mb-4">
                  {product.oldPrice ? (
                    <>
                      <span className="text-lg font-bold text-green-600">{product.price} грн</span>
                      <span className="text-sm text-gray-400 line-through">{product.oldPrice} грн</span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-green-600">{product.price} грн</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    data-testid={`add-to-cart-wishlist-${product.id}`}
                    disabled={removingIds.has(product.id)}
                    type="button"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>В кошик</span>
                  </button>

                  <button
                    onClick={(e) => handleRemoveWish(product, e)}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:border-red-500 hover:bg-red-50 hover:text-red-500 transition-all active:scale-[0.98] disabled:opacity-50"
                    data-testid={`remove-wishlist-${product.id}`}
                    disabled={removingIds.has(product.id)}
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
