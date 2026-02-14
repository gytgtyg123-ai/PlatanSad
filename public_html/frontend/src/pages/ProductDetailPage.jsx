import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi } from '../api/productsApi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import {
  ShoppingCart, Heart, ArrowLeft, Minus, Plus, Zap, Check, Truck, ShieldCheck, CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import QuickOrderModal from '../components/QuickOrderModal';
import SimilarProducts from '../components/SimilarProducts';
import RecentlyViewed, { addToRecentlyViewed } from '../components/RecentlyViewed';
import ProductGallery from '../components/ProductGallery';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showQuickOrder, setShowQuickOrder] = useState(false);

  const { addToCart, cartLoading } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productsApi.getProduct(id);
        setProduct(data);
        addToRecentlyViewed(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Помилка завантаження товару');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    setQuantity(1);
    window.scrollTo(0, 0);
  }, [id, navigate]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const getBadgeName = (badge) => {
    switch (badge) {
      case 'sale': return 'РОЗПРОДАЖ';
      case 'new': return 'НОВИНКА';
      case 'hit': return 'ХІТ';
      default: return badge;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          <div className="text-gray-500 font-medium">Завантаження...</div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const isFavorite = isInWishlist(product.id);

  return (
    <div className="min-h-screen bg-gray-50 pb-10 sm:pb-12">
      {/* Mobile Back Bar */}
      <div className="lg:hidden sticky top-[56px] z-30 bg-white/95 backdrop-blur border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-3 py-2">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </button>
        </div>
      </div>

      {/* Desktop Back */}
      <div className="hidden lg:block bg-white border-b sticky top-[72px] md:top-[88px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 sm:mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">
            {/* Product Image Section */}
            <div className="relative bg-gray-50 p-3 sm:p-4 md:p-8 flex items-center justify-center">
              <div className="relative">
                <ProductGallery 
                  images={product.images || []} 
                  mainImage={product.image} 
                  productName={product.name}
                />

                {/* Badges */}
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-2 z-20">
                  {product.badges?.map(badge => (
                    <span
                      key={badge}
                      className={`
                        text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-md text-white shadow-sm uppercase tracking-wider
                        ${badge === 'sale' ? 'bg-red-500' : ''}
                        ${badge === 'new' ? 'bg-green-500' : ''}
                        ${badge === 'hit' ? 'bg-orange-500' : ''}
                      `}
                    >
                      {getBadgeName(badge)}
                    </span>
                  ))}
                </div>

                {product.discount > 0 && (
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20">
                    <span className="bg-red-600 text-white text-base sm:text-lg font-bold px-3 py-1 rounded-lg shadow-sm">
                      -{product.discount}%
                    </span>
                  </div>
                )}

                {/* Mobile Favorite */}
                <button
                  onClick={() => toggleWishlist(product.id, product.name)}
                  className={`lg:hidden absolute bottom-16 right-3 p-3 rounded-full shadow-md border transition-colors z-20 ${
                    isFavorite ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white text-gray-500 border-gray-200'
                  }`}
                  aria-label="В обране"
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Product Info Section */}
            <div className="p-4 sm:p-6 md:p-8 lg:pr-12 flex flex-col h-full">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-xs sm:text-sm text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">
                  Арт: {product.article}
                </span>

                {/* Desktop Favorite */}
                <div className="hidden lg:flex items-center gap-2">
                  <button
                    onClick={() => toggleWishlist(product.id, product.name)}
                    className={`p-2 rounded-full transition-colors ${
                      isFavorite
                        ? 'bg-red-50 text-red-500'
                        : 'text-gray-400 hover:bg-gray-100 hover:text-red-500'
                    }`}
                    title="В обране"
                  >
                    <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 leading-tight">
                {product.name}
              </h1>

              <div className="text-green-600 font-medium mb-5 sm:mb-6 text-sm sm:text-base">
                {product.category}
              </div>

              {/* Price Block */}
              <div className="bg-gray-50 rounded-xl p-4 mb-5 sm:mb-6 border border-gray-100">
                <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                        {product.price} ₴
                      </span>
                      {product.oldPrice && (
                        <span className="text-base sm:text-xl text-gray-400 line-through">
                          {product.oldPrice} ₴
                        </span>
                      )}
                    </div>

                    {product.stock > 0 ? (
                      <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium mt-1">
                        <Check className="w-4 h-4" />
                        <span>В наявності</span>
                      </div>
                    ) : (
                      <div className="text-red-500 text-sm font-medium mt-1">
                        Немає в наявності
                      </div>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1 shadow-sm w-full sm:w-auto">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                      aria-label="Зменшити кількість"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      readOnly
                      className="w-full sm:w-12 text-center text-lg font-bold text-gray-800 focus:outline-none bg-transparent"
                    />
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock}
                      className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                      aria-label="Збільшити кількість"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={cartLoading || product.stock === 0}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3.5 px-6 rounded-xl font-bold text-base sm:text-lg transition-all active:scale-[0.98] disabled:opacity-50 shadow-md hover:shadow-lg"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Купити
                  </button>
                  <button
                    onClick={() => setShowQuickOrder(true)}
                    disabled={product.stock === 0}
                    className="flex items-center justify-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700 py-3.5 px-6 rounded-xl font-bold text-base sm:text-lg transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <Zap className="w-5 h-5" />
                    Швидке замовлення
                  </button>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/50">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-gray-900">Доставка</div>
                    <div className="text-xs text-gray-500">По всій Україні</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50/50">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-gray-900">Гарантія</div>
                    <div className="text-xs text-gray-500">Якість перевірено</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50/50">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-gray-900">Оплата</div>
                    <div className="text-xs text-gray-500">Зручним способом</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-auto">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-3">Опис товару</h3>
                <div className="prose prose-sm sm:prose-base text-gray-600 leading-relaxed max-w-none">
                  <p>{product.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        <SimilarProducts category={product.category} currentProductId={product.id} />

        {/* Recently Viewed */}
        <RecentlyViewed currentProductId={product.id} />
      </div>

      {/* Mobile Sticky Buy Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-[0_-8px_24px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="max-w-7xl mx-auto px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500">Ціна</div>
              <div className="text-lg font-extrabold text-gray-900 truncate">
                {product.price} ₴
                {product.oldPrice && (
                  <span className="ml-2 text-sm text-gray-400 line-through font-semibold">
                    {product.oldPrice} ₴
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={cartLoading || product.stock === 0}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <ShoppingCart className="w-5 h-5" />
              Купити
            </button>

            <button
              onClick={() => setShowQuickOrder(true)}
              disabled={product.stock === 0}
              className="flex items-center justify-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700 py-3 px-4 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
              title="Швидке замовлення"
            >
              <Zap className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <QuickOrderModal
        product={product}
        isOpen={showQuickOrder}
        onClose={() => setShowQuickOrder(false)}
        quantity={quantity}
      />
    </div>
  );
};

export default ProductDetailPage;

