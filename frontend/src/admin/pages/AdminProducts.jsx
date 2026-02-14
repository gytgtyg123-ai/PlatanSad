import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import Portal from '../../components/Portal';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllCategories,
  uploadImage,
  getImageUrl
} from '../api/adminApi';
import { Plus, Trash2, X, Upload, Search, Filter, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const MAX_IMAGES = 5;
const MAX_WIDTH = 1600;
const QUALITY = 0.8;

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Form validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    article: '',
    price: 0,
    oldPrice: null,
    discount: 0,
    category: '',
    stock: 100,
    description: '',
    badges: [],
    images: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        getAllProducts(),
        getAllCategories()
      ]);
      // API returns {products: [], total: ...}
      setProducts(Array.isArray(productsData) ? productsData : (productsData?.products || []));
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch {
      toast.error('Помилка завантаження');
    } finally {
      setLoading(false);
    }
  };

  const generateArticle = () => {
    const prefix = 'PS';
    const random = Math.floor(Math.random() * 900000) + 100000;
    return `${prefix}-${random}`;
  };

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Назва товару обов\'язкова';
        if (value.length < 3) return 'Мінімум 3 символи';
        return '';
      case 'price':
        if (!value || parseFloat(value) <= 0) return 'Введіть коректну ціну';
        return '';
      case 'category':
        if (!value) return 'Оберіть категорію';
        return '';
      case 'images':
        if (!value || value.length === 0) return 'Додайте хоча б одне фото';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: validateField('name', formData.name),
      price: validateField('price', formData.price),
      category: validateField('category', formData.category),
      images: validateField('images', formData.images)
    };
    setErrors(newErrors);
    setTouched({ name: true, price: true, category: true, images: true });
    return !Object.values(newErrors).some(error => error);
  };

  const handleFieldChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, formData[name]) }));
  };

  const openModal = (product = null) => {
    setErrors({});
    setTouched({});
    if (product) {
      setEditingProduct(product);
      // If images array is empty but single image exists, use single image
      const productImages = (product.images && product.images.length > 0) 
        ? product.images 
        : (product.image ? [product.image] : []);
      setFormData({
        name: product.name || '',
        article: product.article || '',
        price: product.price || 0,
        oldPrice: product.oldPrice || null,
        discount: product.discount || 0,
        category: product.category || '',
        stock: product.stock || 100,
        description: product.description || '',
        badges: product.badges || [],
        images: productImages
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        article: generateArticle(),
        price: 0,
        oldPrice: null,
        discount: 0,
        category: categories.length > 0 ? categories[0].name : '',
        stock: 100,
        description: '',
        badges: [],
        images: []
      });
    }
    setIsModalOpen(true);
    setIsClosing(false);
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setEditingProduct(null);
      setIsClosing(false);
    }, 200);
  };

  const compressImage = (file) =>
    new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = MAX_WIDTH / img.width;
        canvas.width = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
        canvas.height = img.width > MAX_WIDTH ? img.height * scale : img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          },
          'image/jpeg',
          QUALITY
        );
      };

      reader.readAsDataURL(file);
    });

  const handleFiles = useCallback(
    async (files) => {
      if (!files.length) return;

      if (formData.images.length >= MAX_IMAGES) {
        toast.error(`Максимум ${MAX_IMAGES} фото`);
        return;
      }

      setUploading(true);

      try {
        const newImages = [...formData.images];

        for (let file of files) {
          if (newImages.length >= MAX_IMAGES) break;

          const compressed = await compressImage(file);
          const result = await uploadImage(compressed);
          newImages.push(result.url);
        }

        setFormData(prev => ({ ...prev, images: newImages }));
        setErrors(prev => ({ ...prev, images: '' }));
        toast.success('Фото додано');
      } catch (err) {
        console.error('Upload error:', err);
        toast.error('Помилка завантаження фото');
      } finally {
        setUploading(false);
        setIsDragging(false);
      }
    },
    [formData]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = (index) => {
    const updated = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: updated }));
    if (updated.length === 0) {
      setErrors(prev => ({ ...prev, images: 'Додайте хоча б одне фото' }));
    }
  };

  const toggleBadge = (badge) => {
    const badges = formData.badges.includes(badge)
      ? formData.badges.filter(b => b !== badge)
      : [...formData.badges, badge];
    setFormData(prev => ({ ...prev, badges }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Заповніть всі обов\'язкові поля');
      return;
    }

    const productData = {
      name: formData.name,
      article: formData.article || generateArticle(),
      price: parseFloat(formData.price) || 0,
      oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
      discount: parseInt(formData.discount) || 0,
      category: formData.category,
      stock: parseInt(formData.stock) || 0,
      description: formData.description || '',
      badges: formData.badges,
      image: formData.images[0],
      images: formData.images
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast.success('Товар оновлено');
      } else {
        await createProduct(productData);
        toast.success('Товар створено');
      }
      closeModal();
      loadData();
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Помилка збереження');
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Видалити товар "${product.name}"?`)) return;
    try {
      await deleteProduct(product.id);
      toast.success('Видалено');
      loadData();
    } catch {
      toast.error('Помилка видалення');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchTerm || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.article?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Товари ({products.length})</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          data-testid="add-product-btn"
        >
          <Plus size={18} className="mr-2" />
          Додати товар
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Пошук за назвою або артикулом..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
            data-testid="search-products"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-10 pr-8 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 appearance-none"
            data-testid="filter-category"
          >
            <option value="">Всі категорії</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredProducts.map((product) => (
          <div 
            key={product.id} 
            className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden hover:shadow-lg transition-shadow" 
            data-testid={`admin-product-card-${product.id}`}
          >
            <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-700">
              {(product.image || (product.images && product.images.length > 0)) ? (
                <img
                  src={getImageUrl(product.image || product.images[0])}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Немає фото
                </div>
              )}
              {product.badges && product.badges.length > 0 && (
                <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                  {product.badges.map((badge, i) => (
                    <span key={i} className={`text-xs px-2 py-0.5 rounded-full font-medium text-white ${
                      badge === 'hit' ? 'bg-orange-500' : badge === 'new' ? 'bg-blue-500' : badge === 'sale' ? 'bg-red-500' : 'bg-gray-500'
                    }`}>{badge}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-semibold mb-1 text-sm line-clamp-2" title={product.name}>{product.name}</h3>
              <p className="text-xs text-gray-400 mb-1">{product.article}</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-600 font-bold">{product.price} ₴</span>
                {product.oldPrice && (
                  <span className="text-gray-400 line-through text-xs">{product.oldPrice} ₴</span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.category}</p>
              <p className="text-xs text-gray-400 mb-3">Залишок: {product.stock} шт.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => openModal(product)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg text-sm transition-colors"
                  data-testid={`edit-product-${product.id}`}
                >
                  Редагувати
                </button>
                <button
                  onClick={() => handleDelete(product)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 rounded-lg transition-colors"
                  data-testid={`delete-product-${product.id}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {searchTerm || filterCategory ? 'Товарів не знайдено' : 'Немає товарів'}
        </div>
      )}

      {/* Modern Glassmorphism Modal */}
      {isModalOpen && (
        <Portal>
          <div 
            className={`dark fixed inset-0 z-[9999] flex items-center justify-center p-4 modal-backdrop-glass ${isClosing ? 'closing' : ''}`}
            onClick={(e) => e.target === e.currentTarget && closeModal()}
            data-testid="product-modal-backdrop"
          >
            <div className={`modal-content-glass rounded-3xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto ${isClosing ? 'closing' : ''}`}>
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {editingProduct ? 'Редагувати товар' : 'Новий товар'}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {editingProduct ? 'Змініть інформацію про товар' : 'Заповніть інформацію про новий товар'}
                  </p>
                </div>
                <button 
                  onClick={closeModal} 
                  className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  data-testid="close-product-modal"
                >
                  <X size={24} />
                </button>
              </div>

            {/* Image Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`upload-zone mb-6 ${isDragging ? 'active' : ''} ${uploading ? 'uploading' : ''} ${errors.images && touched.images ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}`}
              data-testid="product-upload-zone"
            >
              {uploading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-4">
                  <div className="relative">
                    <div className="animate-spin h-10 w-10 border-3 border-green-500 border-t-transparent rounded-full"></div>
                    <div className="absolute inset-0 animate-ping h-10 w-10 border border-green-500 rounded-full opacity-20"></div>
                  </div>
                  <span className="text-emerald-400 font-medium">Завантаження...</span>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-emerald-900/40 flex items-center justify-center">
                    <Upload className="text-emerald-400" size={28} />
                  </div>
                  <p className="text-gray-200 font-medium mb-1">
                    Перетягніть фото сюди
                  </p>
                  <p className="text-gray-500 text-sm mb-3">або</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFiles(Array.from(e.target.files))}
                    className="hidden"
                    id="fileUpload"
                  />
                  <label 
                    htmlFor="fileUpload" 
                    className="inline-block px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl cursor-pointer transition-all hover:scale-105 active:scale-95 font-semibold"
                  >
                    Обрати файли
                  </label>
                  <p className="text-xs text-gray-500 mt-3">
                    Максимум {MAX_IMAGES} фото • JPG, PNG • Перше фото буде основним
                  </p>
                </>
              )}
            </div>
            {errors.images && touched.images && (
              <div className="error-message mb-4">
                <AlertCircle size={14} />
                {errors.images}
              </div>
            )}

            {/* Image Preview Grid */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-5 gap-3 mb-6">
                {formData.images.map((img, index) => (
                  <div 
                    key={index} 
                    className={`image-preview aspect-square ${index === 0 ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-gray-900' : ''}`}
                  >
                    <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="remove-btn"
                      data-testid={`remove-image-${index}`}
                    >
                      <X size={14} />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-600 to-emerald-500 text-white text-[10px] text-center py-1 font-medium">
                        Основне
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="modal-label required">Назва товару</label>
                <input
                  type="text"
                  placeholder="Введіть назву товару"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={`modal-input ${errors.name && touched.name ? 'error' : ''} ${touched.name && !errors.name && formData.name ? 'success' : ''}`}
                  data-testid="product-name-input"
                />
                {errors.name && touched.name && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    {errors.name}
                  </div>
                )}
              </div>

              {/* Article and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="modal-label">Артикул</label>
                  <input
                    type="text"
                    placeholder="PS-123456"
                    value={formData.article}
                    onChange={(e) => handleFieldChange('article', e.target.value)}
                    className="modal-input"
                    data-testid="product-article-input"
                  />
                </div>
                <div>
                  <label className="modal-label required">Категорія</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    onBlur={() => handleBlur('category')}
                    className={`modal-select ${errors.category && touched.category ? 'error' : ''}`}
                    data-testid="product-category-select"
                  >
                    <option value="">Оберіть категорію</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category && touched.category && (
                    <div className="error-message">
                      <AlertCircle size={14} />
                      {errors.category}
                    </div>
                  )}
                </div>
              </div>

              {/* Price and Old Price */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="modal-label required">Ціна (₴)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => handleFieldChange('price', e.target.value)}
                    onBlur={() => handleBlur('price')}
                    className={`modal-input ${errors.price && touched.price ? 'error' : ''}`}
                    data-testid="product-price-input"
                  />
                  {errors.price && touched.price && (
                    <div className="error-message">
                      <AlertCircle size={14} />
                      {errors.price}
                    </div>
                  )}
                </div>
                <div>
                  <label className="modal-label">Стара ціна (₴)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={formData.oldPrice || ''}
                    onChange={(e) => handleFieldChange('oldPrice', e.target.value || null)}
                    className="modal-input"
                    data-testid="product-oldprice-input"
                  />
                </div>
                <div>
                  <label className="modal-label">Залишок (шт)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="100"
                    value={formData.stock}
                    onChange={(e) => handleFieldChange('stock', e.target.value)}
                    className="modal-input"
                    data-testid="product-stock-input"
                  />
                </div>
              </div>

              {/* Badges */}
              <div>
                <label className="modal-label">Бейджі</label>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { id: 'hit', label: 'Хіт', color: 'bg-gradient-to-r from-orange-500 to-orange-600', ring: 'ring-orange-500' },
                    { id: 'new', label: 'Новинка', color: 'bg-gradient-to-r from-blue-500 to-blue-600', ring: 'ring-blue-500' },
                    { id: 'sale', label: 'Акція', color: 'bg-gradient-to-r from-red-500 to-red-600', ring: 'ring-red-500' }
                  ].map(badge => (
                    <button
                      key={badge.id}
                      type="button"
                      onClick={() => toggleBadge(badge.id)}
                      className={`badge-btn ${
                        formData.badges.includes(badge.id)
                          ? `${badge.color} text-white active ${badge.ring}`
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      data-testid={`badge-${badge.id}`}
                    >
                      {formData.badges.includes(badge.id) && <CheckCircle2 size={14} className="inline mr-1" />}
                      {badge.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="modal-label">Опис</label>
                <textarea
                  placeholder="Введіть опис товару..."
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="modal-textarea min-h-[120px]"
                  data-testid="product-description-input"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 modal-btn-primary"
                  data-testid="save-product-btn"
                >
                  {editingProduct ? 'Зберегти зміни' : 'Створити товар'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 modal-btn-secondary"
                >
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        </div>
        </Portal>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
