import React, { useEffect, useMemo, useRef, useState, useCallback, memo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from '../api/productsApi';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, X, Grid3X3, LayoutGrid, ChevronDown } from 'lucide-react';

// Memoized ProductCard wrapper for performance
const MemoizedProductCard = memo(({ product }) => (
  <ProductCard product={product} variant="catalog" />
));

const ITEMS_PER_PAGE = 20; // Show 20 items initially, load more on scroll/click

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  const [showFilters, setShowFilters] = useState(false);
  const [compactView, setCompactView] = useState(true);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    badge: searchParams.get('badge') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'name',
    search: searchParams.get('search') || '',
  });

  // URL -> state sync
  useEffect(() => {
    const next = {
      category: searchParams.get('category') || '',
      badge: searchParams.get('badge') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      sortBy: searchParams.get('sortBy') || 'name',
      search: searchParams.get('search') || '',
    };

    setFilters((prev) => {
      const same =
        prev.category === next.category &&
        prev.badge === next.badge &&
        prev.minPrice === next.minPrice &&
        prev.maxPrice === next.maxPrice &&
        prev.sortBy === next.sortBy &&
        prev.search === next.search;
      if (!same) {
        setDisplayCount(ITEMS_PER_PAGE); // Reset pagination on filter change
      }
      return same ? prev : next;
    });
  }, [searchParams]);

  // mobile view auto
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    if (mq.matches) setCompactView(true);

    const apply = () => setCompactView((prev) => (mq.matches ? true : prev));
    if (mq.addEventListener) mq.addEventListener('change', apply);
    else mq.addListener(apply);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', apply);
      else mq.removeListener(apply);
    };
  }, []);

  // lock body scroll when bottom sheet open
  useEffect(() => {
    if (!showFilters) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showFilters]);

  const quickFilters = useMemo(
    () => [
      { key: 'hit', label: 'Хіти', color: 'from-amber-400 to-orange-500' },
      { key: 'new', label: 'Новинки', color: 'from-green-500 to-emerald-500' },
      { key: 'sale', label: 'Знижки', color: 'from-red-500 to-rose-500' },
    ],
    []
  );

  const updateParam = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setDisplayCount(ITEMS_PER_PAGE); // Reset pagination
    updateParam(key, value);
  }, [updateParam]);

  const clearFilters = useCallback(() => {
    const reset = { category: '', badge: '', minPrice: '', maxPrice: '', sortBy: 'name', search: '' };
    setFilters(reset);
    setDisplayCount(ITEMS_PER_PAGE);
    setSearchParams({}, { replace: true });
    setShowFilters(false);
  }, [setSearchParams]);

  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(([k, v]) => {
      if (!v) return false;
      if (k === 'sortBy' && v === 'name') return false;
      return true;
    }).length;
  }, [filters]);

  const abortRef = useRef(null);

  // Load ALL products once
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const data = await productsApi.getProducts({}, { signal: controller.signal });
        // API returns {products: [], total: ...}
        setProducts(Array.isArray(data) ? data : (data?.products || []));
      } catch (error) {
        if (error?.name === 'AbortError') return;
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // Filter/sort on frontend (memoized)
  const visibleProducts = useMemo(() => {
    let list = Array.isArray(products) ? [...products] : [];

    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter((p) => {
        const name = String(p?.name ?? '').toLowerCase();
        const cat = String(p?.category ?? '').toLowerCase();
        return name.includes(q) || cat.includes(q);
      });
    }

    if (filters.category) {
      list = list.filter((p) => String(p.category || '') === String(filters.category));
    }

    if (filters.badge) {
      list = list.filter((p) => Array.isArray(p.badges) && p.badges.includes(filters.badge));
    }

    const min = filters.minPrice !== '' ? Number(filters.minPrice) : null;
    const max = filters.maxPrice !== '' ? Number(filters.maxPrice) : null;

    if (min != null && !Number.isNaN(min)) list = list.filter((p) => Number(p.price) >= min);
    if (max != null && !Number.isNaN(max)) list = list.filter((p) => Number(p.price) <= max);

    const sortBy = filters.sortBy || 'name';
    if (sortBy === 'price') {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === '-price') {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else {
      list.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'uk'));
    }

    return list;
  }, [products, filters]);

  // Paginated products for display
  const displayedProducts = useMemo(() => {
    return visibleProducts.slice(0, displayCount);
  }, [visibleProducts, displayCount]);

  const hasMore = displayCount < visibleProducts.length;
  const remainingCount = visibleProducts.length - displayCount;

  const loadMore = useCallback(() => {
    setDisplayCount((prev) => Math.min(prev + ITEMS_PER_PAGE, visibleProducts.length));
  }, [visibleProducts.length]);

  // Infinite scroll observer
  const loadMoreRef = useRef(null);
  useEffect(() => {
    if (!hasMore || loading) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  const showInstagramButton = filters.category === 'Кімнатні рослини';

  return (
    <div className="min-h-screen bg-gray-50 py-3 sm:py-6 pb-20 sm:pb-10" data-testid="catalog-page">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        .skeleton {
          position: relative;
          overflow: hidden;
          background: rgba(229,231,235,.75);
        }
        .skeleton::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-60%);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent);
          animation: shimmer 1.2s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-60%); }
          100% { transform: translateX(60%); }
        }

        @keyframes slideUp {
          from { transform: translateY(14px); opacity: .6; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slideUp .18s ease-out; }

        .ig-premium-btn {
          position: relative;
          overflow: hidden;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* Toolbar */}
        <div className="z-30 -mx-2 px-2 sm:mx-0 sm:px-0">
          <div className="rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
            <div className="p-3 sm:p-4 flex items-start sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800" data-testid="catalog-title">
                  Каталог
                  {!loading && (
                    <span className="text-gray-400 font-normal ml-2 text-sm sm:text-lg">
                      ({visibleProducts.length})
                    </span>
                  )}
                </h1>

                <div className="mt-2 flex items-center gap-2">
                  <input
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Пошук товарів…"
                    className="w-full sm:w-[420px] px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 bg-white"
                  />

                  {filters.search?.trim() && (
                    <button
                      onClick={() => handleFilterChange('search', '')}
                      className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-95"
                      aria-label="Очистити пошук"
                      type="button"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setCompactView((v) => !v)}
                  className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 active:scale-95"
                  aria-label="Змінити вигляд"
                  type="button"
                >
                  {compactView ? (
                    <LayoutGrid className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Grid3X3 className="w-5 h-5 text-gray-600" />
                  )}
                </button>

                <button
                  onClick={() => setShowFilters(true)}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-md active:scale-95"
                  aria-label="Відкрити фільтри"
                  data-testid="filter-btn"
                  type="button"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  <span className="font-medium text-sm hidden sm:inline">Фільтри</span>
                  {activeFiltersCount > 0 && (
                    <span className="bg-white text-green-600 text-xs min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Quick badge filters */}
            <div className="px-3 sm:px-4 pb-3 sm:pb-4 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 min-w-max sm:flex-wrap">
                {quickFilters.map((qf) => (
                  <button
                    key={qf.key}
                    onClick={() => handleFilterChange('badge', filters.badge === qf.key ? '' : qf.key)}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors active:scale-95 ${
                      filters.badge === qf.key
                        ? `bg-gradient-to-r ${qf.color} text-white shadow-lg`
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                    }`}
                    type="button"
                  >
                    {qf.label}
                  </button>
                ))}

                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95"
                    type="button"
                  >
                    Скинути
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="h-3 sm:h-4" />
        </div>

        {/* Instagram button */}
        {showInstagramButton && (
          <div className="mb-3 sm:mb-4">
            <a
              href="https://instagram.com/maisternia.roslyn"
              target="_blank"
              rel="noreferrer"
              className="ig-premium-btn inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-fuchsia-500 via-pink-500 to-amber-400 hover:opacity-95"
              aria-label="Instagram @maisternia.roslyn"
            >
              @maisternia.roslyn
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Filters Sidebar (desktop) */}
          <div className="lg:block">
            <div className="hidden lg:block bg-white rounded-2xl shadow-md p-6 sticky top-28">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Фільтри</h2>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="text-sm font-medium text-gray-500 hover:text-gray-700" type="button">
                    Скинути
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Категорія</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Всі категорії</option>
                    <option value="Бонсай Нівакі">Бонсай Нівакі</option>
                    <option value="Туя Колумна">Туя Колумна</option>
                    <option value="Туя Смарагд">Туя Смарагд</option>
                    <option value="Хвойні рослини">Хвойні рослини</option>
                    <option value="Листопадні дерева">Листопадні дерева</option>
                    <option value="Кімнатні рослини">Кімнатні рослини</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Тип</label>
                  <select
                    value={filters.badge}
                    onChange={(e) => handleFilterChange('badge', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Всі товари</option>
                    <option value="hit">Хіти</option>
                    <option value="new">Новинки</option>
                    <option value="sale">Знижки</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ціна (грн)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-1/2 px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Від"
                      min="0"
                    />
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-1/2 px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="До"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Сортування</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="name">За назвою</option>
                    <option value="price">Ціна: за зростанням</option>
                    <option value="-price">Ціна: за спаданням</option>
                  </select>
                </div>

                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="w-full py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors active:scale-95"
                    type="button"
                  >
                    Скинути фільтри
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    <div className="aspect-[4/3] sm:aspect-square skeleton" />
                    <div className="p-3 sm:p-4 space-y-2">
                      <div className="h-3 skeleton rounded w-2/3" />
                      <div className="h-4 skeleton rounded w-full" />
                      <div className="h-6 skeleton rounded w-1/2" />
                      <div className="h-9 skeleton rounded w-full mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayedProducts.length > 0 ? (
              <>
                <div
                  className={`grid gap-3 sm:gap-4 lg:gap-6 ${
                    compactView ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                  }`}
                  data-testid="products-grid"
                >
                  {displayedProducts.map((product) => (
                    <MemoizedProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div ref={loadMoreRef} className="mt-6 flex justify-center">
                    <button
                      onClick={loadMore}
                      className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-green-500 text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-colors active:scale-95"
                      type="button"
                    >
                      <span>Показати ще ({remainingCount})</span>
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Progress indicator */}
                <div className="mt-4 text-center text-sm text-gray-500">
                  Показано {displayedProducts.length} з {visibleProducts.length}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-md p-6 sm:p-12 text-center border border-gray-100">
                <p className="text-gray-700 font-semibold mb-1">Товарів не знайдено</p>
                <p className="text-gray-500 text-sm mb-4">Спробуйте змінити фільтри або очистити їх.</p>
                <button onClick={clearFilters} className="text-green-600 hover:text-green-700 font-semibold" type="button">
                  Скинути фільтри
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet filters */}
      {showFilters && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setShowFilters(false)} />

          <div
            className="lg:hidden fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-2xl shadow-2xl max-h-[75vh] overflow-y-auto animate-slide-up"
            role="dialog"
            aria-modal="true"
            aria-label="Фільтри"
          >
            <div className="px-4 pt-3 pb-2 sticky top-0 bg-white rounded-t-2xl border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-10 rounded-full bg-gray-200" />
                  <h2 className="text-lg font-bold text-gray-800">Фільтри</h2>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full"
                  aria-label="Закрити"
                  type="button"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="space-y-4 px-4 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Категорія</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Всі категорії</option>
                  <option value="Бонсай Нівакі">Бонсай Нівакі</option>
                  <option value="Туя Колумна">Туя Колумна</option>
                  <option value="Туя Смарагд">Туя Смарагд</option>
                  <option value="Хвойні рослини">Хвойні рослини</option>
                  <option value="Листопадні дерева">Листопадні дерева</option>
                  <option value="Кімнатні рослини">Кімнатні рослини</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Тип</label>
                <select
                  value={filters.badge}
                  onChange={(e) => handleFilterChange('badge', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Всі товари</option>
                  <option value="hit">Хіти</option>
                  <option value="new">Новинки</option>
                  <option value="sale">Знижки</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ціна (грн)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-1/2 px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Від"
                    min="0"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-1/2 px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="До"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Сортування</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="name">За назвою</option>
                  <option value="price">Ціна: за зростанням</option>
                  <option value="-price">Ціна: за спаданням</option>
                </select>
              </div>

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="w-full py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors active:scale-95"
                  type="button"
                >
                  Скинути фільтри
                </button>
              )}

              <button
                onClick={() => setShowFilters(false)}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors active:scale-95"
                data-testid="apply-filters-btn"
                type="button"
              >
                Застосувати
              </button>

              <div className="pb-2" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CatalogPage;