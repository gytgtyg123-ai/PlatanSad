import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersApi } from '../api/ordersApi';
import { toast } from 'sonner';
import {
  ArrowLeft,
  MapPin,
  Package,
  Truck,
  CheckCircle2,
  ChevronDown,
  Banknote,
  X,
  User,
  Phone,
  MessageSquare,
  ShoppingBag,
  Check,
  Search,
} from 'lucide-react';
import { searchCities, getWarehouses, popularCities } from '../api/novaPoshtaApi';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '+380',
    deliveryAddress: '',
    deliveryMethod: 'nova_poshta',
    paymentMethod: 'cash_on_delivery',
    notes: '',
    city: null,
    warehouse: null,
  });

  const [errors, setErrors] = useState({});

  // Nova Poshta states
  const [citySearch, setCitySearch] = useState('');
  const [cities, setCities] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  // Mobile bottom-sheet states
  const [citySheetOpen, setCitySheetOpen] = useState(false);
  const [warehouseSheetOpen, setWarehouseSheetOpen] = useState(false);

  // Refs
  const cityInputRef = useRef(null);
  const warehouseInputRef = useRef(null);
  const mobileSearchRef = useRef(null);

  /* =================== EFFECTS =================== */

  // Search cities with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (citySearch.length >= 2) {
        setLoadingCities(true);
        try {
          const results = await searchCities(citySearch);
          setCities(results);
        } catch (error) {
          console.error('Error searching cities:', error);
          setCities([]);
        } finally {
          setLoadingCities(false);
        }
      } else {
        setCities([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [citySearch]);

  // Load warehouses when city changes
  useEffect(() => {
    const loadWarehouses = async () => {
      if (formData.city?.ref) {
        setLoadingWarehouses(true);
        try {
          const results = await getWarehouses(formData.city.ref);
          setWarehouses(results);
        } catch (error) {
          console.error('Error loading warehouses:', error);
          setWarehouses([]);
        } finally {
          setLoadingWarehouses(false);
        }
      } else {
        setWarehouses([]);
      }
    };

    loadWarehouses();
  }, [formData.city]);

  // Close dropdowns on outside click (desktop)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityInputRef.current && !cityInputRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
      if (warehouseInputRef.current && !warehouseInputRef.current.contains(event.target)) {
        setShowWarehouseDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when bottom-sheet open
  useEffect(() => {
    const body = document.body;
    if (citySheetOpen || warehouseSheetOpen) {
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = '';
    }
    return () => {
      body.style.overflow = '';
    };
  }, [citySheetOpen, warehouseSheetOpen]);

  // Focus search input when city sheet opens
  useEffect(() => {
    if (citySheetOpen && mobileSearchRef.current) {
      setTimeout(() => mobileSearchRef.current?.focus(), 100);
    }
  }, [citySheetOpen]);

  /* =================== HANDLERS =================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'customerPhone') {
      if (!value.startsWith('+380')) return;
      const phoneDigits = value.slice(4).replace(/\D/g, '');
      setFormData((prev) => ({
        ...prev,
        [name]: '+380' + phoneDigits.slice(0, 9),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCitySelect = useCallback((city) => {
    setFormData((prev) => ({
      ...prev,
      city,
      warehouse: null,
      deliveryAddress: '',
    }));
    setCitySearch(city.name);
    setShowCityDropdown(false);
    setCitySheetOpen(false);
    setErrors((prev) => ({ ...prev, city: '' }));
  }, []);

  const handleWarehouseSelect = useCallback((warehouse) => {
    setFormData((prev) => ({
      ...prev,
      warehouse,
      deliveryAddress: `${prev.city?.name || ''}, ${warehouse.description}`,
    }));
    setShowWarehouseDropdown(false);
    setWarehouseSheetOpen(false);
    setErrors((prev) => ({ ...prev, warehouse: '' }));
  }, []);

  const handleClearCity = useCallback(() => {
    setCitySearch('');
    setFormData((prev) => ({
      ...prev,
      city: null,
      warehouse: null,
      deliveryAddress: '',
    }));
    setWarehouses([]);
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Обов'язкове поле";
    }

    if (!formData.customerPhone.trim() || formData.customerPhone.length < 13) {
      newErrors.customerPhone = 'Введіть коректний номер';
    }

    if (formData.deliveryMethod === 'nova_poshta') {
      if (!formData.city) newErrors.city = 'Оберіть місто';
      if (!formData.warehouse) newErrors.warehouse = 'Оберіть відділення';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Будь ласка, заповніть всі обов\'язкові поля');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        ...formData,
        items: cartItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: cartTotal,
        userId: 'guest',
        paymentStatus: 'pending',
      };

      const order = await ordersApi.createOrder(orderData);
      await clearCart();
      toast.success('Замовлення успішно оформлено!');
      navigate(`/order-success/${order.id}`);
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Помилка оформлення замовлення');
    } finally {
      setLoading(false);
    }
  };

  /* =================== COMPONENTS =================== */

  const CityList = ({ onPick }) => (
    <div className="overflow-y-auto overscroll-contain">
      {loadingCities ? (
        <div className="p-6 text-center text-gray-500 text-sm">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Пошук міст...
        </div>
      ) : citySearch.length < 2 ? (
        <>
          <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 font-semibold uppercase tracking-wide sticky top-0">
            Популярні міста
          </div>
          {popularCities.slice(0, 8).map((city, i) => (
            <button
              key={i}
              type="button"
              onClick={async () => {
                setCitySearch(city);
                const results = await searchCities(city);
                if (results.length > 0) onPick(results[0]);
              }}
              className="w-full px-4 py-3.5 text-left hover:bg-green-50 active:bg-green-100 transition-colors border-b border-gray-100 last:border-0"
            >
              <span className="text-sm font-medium text-gray-800">{city}</span>
            </button>
          ))}
        </>
      ) : cities.length > 0 ? (
        cities.map((city) => (
          <button
            key={city.ref}
            type="button"
            onClick={() => onPick(city)}
            className="w-full px-4 py-3.5 text-left hover:bg-green-50 active:bg-green-100 transition-colors border-b border-gray-100 last:border-0"
          >
            <div className="text-sm font-semibold text-gray-800">{city.name}</div>
            <div className="text-xs text-gray-500 mt-0.5">{city.area} область</div>
          </button>
        ))
      ) : (
        <div className="p-6 text-center text-gray-500 text-sm">
          Місто не знайдено
        </div>
      )}
    </div>
  );

  const WarehouseList = ({ onPick }) => (
    <div className="overflow-y-auto overscroll-contain">
      {loadingWarehouses ? (
        <div className="p-6 text-center text-gray-500 text-sm">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Завантаження відділень...
        </div>
      ) : warehouses.length > 0 ? (
        <>
          <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 font-semibold uppercase tracking-wide sticky top-0">
            {warehouses.length} відділень
          </div>
          {warehouses.map((warehouse) => (
            <button
              key={warehouse.ref}
              type="button"
              onClick={() => onPick(warehouse)}
              className={`w-full px-4 py-3.5 text-left hover:bg-green-50 active:bg-green-100 transition-colors border-b border-gray-100 last:border-0 ${
                warehouse.isPostomat ? 'bg-yellow-50/50' : ''
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-gray-800 flex-1">
                  {warehouse.description}
                </span>
                {warehouse.isPostomat && (
                  <span className="text-[10px] bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                    ПОШТОМАТ
                  </span>
                )}
              </div>
            </button>
          ))}
        </>
      ) : (
        <div className="p-6 text-center text-gray-500 text-sm">
          Немає відділень
        </div>
      )}
    </div>
  );

  /* =================== EARLY RETURNS =================== */

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-7 sm:p-12 text-center max-w-md w-full shadow-xl">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Кошик порожній</h2>
          <p className="text-gray-500 mb-8 text-sm">
            Додайте товари до кошика перед оформленням замовлення
          </p>
          <button
            onClick={() => navigate('/catalog')}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-500/30 hover:shadow-xl active:scale-[0.98] transition-all"
          >
            Перейти до каталогу
          </button>
        </div>
      </div>
    );
  }

  /* =================== MAIN RENDER =================== */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-28 sm:pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => navigate('/cart')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
              aria-label="Назад"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="font-bold text-base sm:text-xl text-gray-800">
              Оформлення
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Order Summary */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-xl text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-green-100 text-xs font-medium mb-1">Сума</p>
              <p className="text-2xl sm:text-3xl font-bold">
                {cartTotal.toLocaleString('uk-UA')} ₴
              </p>
            </div>
            <div className="bg-white/20 rounded-xl px-3 py-2">
              <p className="text-xs sm:text-sm font-medium">{cartItems.length} товар.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Contact */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-500 text-white rounded-xl flex items-center justify-center text-sm font-bold">
                1
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800">Контакти</h2>
            </div>

            <div className="space-y-3">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Ім'я та прізвище
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="Ваше ім'я"
                    className={`w-full pl-10 pr-3 py-3 bg-gray-50 rounded-xl border-2 text-sm transition-all outline-none ${
                      errors.customerName
                        ? 'border-red-400 bg-red-50'
                        : 'border-transparent focus:border-green-500 focus:bg-white'
                    }`}
                  />
                </div>
                {errors.customerName && (
                  <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Телефон
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    placeholder="+380XXXXXXXXX"
                    className={`w-full pl-10 pr-3 py-3 bg-gray-50 rounded-xl border-2 text-sm transition-all outline-none ${
                      errors.customerPhone
                        ? 'border-red-400 bg-red-50'
                        : 'border-transparent focus:border-green-500 focus:bg-white'
                    }`}
                    inputMode="tel"
                  />
                </div>
                {errors.customerPhone && (
                  <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>
                )}
              </div>
            </div>
          </div>

          {/* 2. Delivery */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-xl flex items-center justify-center text-sm font-bold">
                2
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800">Доставка</h2>
            </div>

            {/* Delivery Methods */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, deliveryMethod: 'nova_poshta' }))
                }
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  formData.deliveryMethod === 'nova_poshta'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200'
                }`}
              >
                <Truck
                  className={`w-5 h-5 mb-1 ${
                    formData.deliveryMethod === 'nova_poshta'
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                />
                <div className="text-xs font-semibold">Нова Пошта</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, deliveryMethod: 'self_pickup' }))
                }
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  formData.deliveryMethod === 'self_pickup'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200'
                }`}
              >
                <MapPin
                  className={`w-5 h-5 mb-1 ${
                    formData.deliveryMethod === 'self_pickup'
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                />
                <div className="text-xs font-semibold">Самовивіз</div>
              </button>
            </div>

            {/* Nova Poshta Fields */}
            {formData.deliveryMethod === 'nova_poshta' && (
              <div className="space-y-3 pt-3 border-t border-gray-100">
                {/* City Selector */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Місто / Село
                  </label>

                  {/* Mobile Trigger */}
                  <button
                    type="button"
                    onClick={() => setCitySheetOpen(true)}
                    className={`w-full flex items-center gap-2 px-3 py-3 bg-gray-50 rounded-xl border-2 text-left transition-all sm:hidden ${
                      errors.city ? 'border-red-400 bg-red-50' : 'border-transparent'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span
                      className={`flex-1 text-sm truncate ${
                        formData.city ? 'text-gray-800 font-medium' : 'text-gray-400'
                      }`}
                    >
                      {formData.city?.name || 'Оберіть місто'}
                    </span>
                    {formData.city ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearCity();
                        }}
                        className="p-1 hover:bg-gray-200 rounded-full"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </button>

                  {/* Desktop Dropdown */}
                  <div className="relative hidden sm:block" ref={cityInputRef}>
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                    <input
                      type="text"
                      value={citySearch}
                      onChange={(e) => {
                        setCitySearch(e.target.value);
                        setShowCityDropdown(true);
                        if (formData.city) handleClearCity();
                      }}
                      onFocus={() => setShowCityDropdown(true)}
                      placeholder="Почніть вводити назву"
                      className={`w-full pl-10 pr-10 py-3 bg-gray-50 rounded-xl border-2 text-sm transition-all outline-none ${
                        errors.city
                          ? 'border-red-400 bg-red-50'
                          : 'border-transparent focus:border-green-500 focus:bg-white'
                      }`}
                    />
                    {formData.city && (
                      <button
                        type="button"
                        onClick={handleClearCity}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    )}

                    {showCityDropdown && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-hidden">
                        <CityList onPick={handleCitySelect} />
                      </div>
                    )}
                  </div>

                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                  )}
                </div>

                {/* Warehouse Selector */}
                {formData.city && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Відділення
                    </label>

                    {/* Mobile Trigger */}
                    <button
                      type="button"
                      onClick={() => !loadingWarehouses && setWarehouseSheetOpen(true)}
                      disabled={loadingWarehouses}
                      className={`w-full flex items-center gap-2 px-3 py-3 bg-gray-50 rounded-xl border-2 text-left transition-all sm:hidden ${
                        errors.warehouse
                          ? 'border-red-400 bg-red-50'
                          : 'border-transparent'
                      }`}
                    >
                      <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span
                        className={`flex-1 text-sm truncate ${
                          formData.warehouse
                            ? 'text-gray-800 font-medium'
                            : 'text-gray-400'
                        }`}
                      >
                        {loadingWarehouses
                          ? 'Завантаження...'
                          : formData.warehouse?.description || 'Оберіть відділення'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </button>

                    {/* Desktop Dropdown */}
                    <div className="relative hidden sm:block" ref={warehouseInputRef}>
                      <button
                        type="button"
                        onClick={() =>
                          !loadingWarehouses && setShowWarehouseDropdown(true)
                        }
                        disabled={loadingWarehouses}
                        className={`w-full flex items-center gap-2 pl-10 pr-3 py-3 bg-gray-50 rounded-xl border-2 text-left text-sm transition-all ${
                          errors.warehouse
                            ? 'border-red-400 bg-red-50'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <Package className="absolute left-3 w-4 h-4 text-gray-400" />
                        <span
                          className={`flex-1 truncate ${
                            formData.warehouse
                              ? 'text-gray-800 font-medium'
                              : 'text-gray-400'
                          }`}
                        >
                          {loadingWarehouses
                            ? 'Завантаження...'
                            : formData.warehouse?.description ||
                              'Оберіть відділення'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </button>

                      {showWarehouseDropdown && warehouses.length > 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-hidden">
                          <WarehouseList onPick={handleWarehouseSelect} />
                        </div>
                      )}
                    </div>

                    {errors.warehouse && (
                      <p className="text-red-500 text-xs mt-1">{errors.warehouse}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Self Pickup Info */}
            {formData.deliveryMethod === 'self_pickup' && (
              <div className="mt-3 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-green-900 mb-1">
                      Адреса розсадника:
                    </p>
                    <p className="text-xs text-green-800">
                      Рівненська обл., Дубенський р-н, смт. Смига
                    </p>
                    <p className="text-xs text-green-600 mt-1">Пн-Сб: 9:00-18:00</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Payment */}
          {formData.deliveryMethod !== 'self_pickup' && (
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-xl flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-800">
                  Оплата
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentMethod: 'cash_on_delivery',
                  }))
                }
                className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                  formData.paymentMethod === 'cash_on_delivery'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200'
                }`}
              >
                <Banknote
                  className={`w-5 h-5 ${
                    formData.paymentMethod === 'cash_on_delivery'
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold">Накладений платіж</div>
                  <div className="text-xs text-gray-500">Оплата при отриманні</div>
                </div>
                {formData.paymentMethod === 'cash_on_delivery' && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
              </button>
            </div>
          )}

          {/* Notes */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700">Коментар</h3>
              <span className="text-xs text-gray-400">(необов'язково)</span>
            </div>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Побажання..."
              rows={2}
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border-2 border-transparent focus:border-green-500 focus:bg-white outline-none resize-none text-sm"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              type="button"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-bold text-base disabled:opacity-50 shadow-lg shadow-green-500/30 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Оформлення...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Підтвердити • {cartTotal.toLocaleString('uk-UA')} ₴</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Mobile City Bottom Sheet */}
      {citySheetOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setCitySheetOpen(false)}
          />
          <div
            className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl flex flex-col animate-slideUp"
            style={{ maxHeight: '85vh' }}
          >
            {/* Header */}
            <div className="flex-shrink-0 px-4 pt-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800">Оберіть місто</span>
                <button
                  type="button"
                  onClick={() => setCitySheetOpen(false)}
                  className="p-2 -mr-2 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Search Input */}
              <div className="mt-3 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={mobileSearchRef}
                  type="text"
                  value={citySearch}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    if (formData.city) handleClearCity();
                  }}
                  placeholder="Введіть назву міста"
                  className="w-full pl-10 pr-10 py-3 bg-gray-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-green-500"
                />
                {citySearch && (
                  <button
                    type="button"
                    onClick={() => setCitySearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain"
              style={{ maxHeight: 'calc(85vh - 140px)' }}
            >
              <CityList onPick={handleCitySelect} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Warehouse Bottom Sheet */}
      {warehouseSheetOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setWarehouseSheetOpen(false)}
          />
          <div
            className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl flex flex-col animate-slideUp"
            style={{ maxHeight: '85vh' }}
          >
            {/* Header */}
            <div className="flex-shrink-0 px-4 pt-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-800">Оберіть відділення</span>
                  {formData.city && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formData.city.name}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setWarehouseSheetOpen(false)}
                  className="p-2 -mr-2 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* List */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain"
              style={{ maxHeight: 'calc(85vh - 100px)' }}
            >
              <WarehouseList onPick={handleWarehouseSelect} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.25s ease-out; }
      `}</style>
    </div>
  );
};

export default CheckoutPage;