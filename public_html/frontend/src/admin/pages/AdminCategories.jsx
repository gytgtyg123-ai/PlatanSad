import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import Portal from '../../components/Portal';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadImage,
  getImageUrl
} from '../api/adminApi';
import { Plus, Trash2, X, Upload, FolderOpen, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const MAX_WIDTH = 1600;
const QUALITY = 0.8;

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Form validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    image: '',
    count: 0
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch {
      toast.error('Помилка завантаження');
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Назва категорії обов\'язкова';
        if (value.length < 2) return 'Мінімум 2 символи';
        return '';
      case 'image':
        if (!value) return 'Додайте фото категорії';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: validateField('name', formData.name),
      image: validateField('image', formData.image)
    };
    setErrors(newErrors);
    setTouched({ name: true, image: true });
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

  const openModal = (category = null) => {
    setErrors({});
    setTouched({});
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || '',
        image: category.image || '',
        count: category.count || 0
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        image: '',
        count: 0
      });
    }
    setIsModalOpen(true);
    setIsClosing(false);
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setEditingCategory(null);
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

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;

      setUploading(true);

      try {
        const compressed = await compressImage(file);
        const result = await uploadImage(compressed);
        setFormData(prev => ({ ...prev, image: result.url }));
        setErrors(prev => ({ ...prev, image: '' }));
        toast.success('Фото завантажено');
      } catch (err) {
        console.error('Upload error:', err);
        toast.error('Помилка завантаження фото');
      } finally {
        setUploading(false);
        setIsDragging(false);
      }
    },
    []
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    setErrors(prev => ({ ...prev, image: 'Додайте фото категорії' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Заповніть всі обов\'язкові поля');
      return;
    }

    const categoryData = {
      name: formData.name,
      image: formData.image,
      count: parseInt(formData.count) || 0
    };

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
        toast.success('Категорію оновлено');
      } else {
        await createCategory(categoryData);
        toast.success('Категорію створено');
      }
      closeModal();
      loadCategories();
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Помилка збереження');
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Видалити категорію "${category.name}"?`)) return;

    try {
      await deleteCategory(category.id);
      toast.success('Видалено');
      loadCategories();
    } catch {
      toast.error('Помилка видалення');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Категорії ({categories.length})</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          data-testid="add-category-btn"
        >
          <Plus size={18} className="mr-2" />
          Додати категорію
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden hover:shadow-lg transition-shadow"
            data-testid={`admin-category-card-${cat.id}`}
          >
            <div className="w-full h-36 bg-gray-100 dark:bg-gray-700">
              {cat.image ? (
                <img
                  src={getImageUrl(cat.image)}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FolderOpen size={48} />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-1 text-lg">{cat.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{cat.count} товарів</p>
              <div className="flex gap-2">
                <button
                  onClick={() => openModal(cat)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition-colors"
                  data-testid={`edit-category-${cat.id}`}
                >
                  Редагувати
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 rounded-lg transition-colors"
                  data-testid={`delete-category-${cat.id}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p>Немає категорій</p>
        </div>
      )}

      {/* Modern Glassmorphism Modal */}
      {isModalOpen && (
        <Portal>
          <div 
            className={`dark fixed inset-0 z-[9999] flex items-center justify-center p-4 modal-backdrop-glass ${isClosing ? 'closing' : ''}`}
            onClick={(e) => e.target === e.currentTarget && closeModal()}
            data-testid="category-modal-backdrop"
          >
            <div className={`modal-content-glass rounded-3xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto ${isClosing ? 'closing' : ''}`}>
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {editingCategory ? 'Редагувати категорію' : 'Нова категорія'}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {editingCategory ? 'Змініть інформацію про категорію' : 'Створіть нову категорію товарів'}
                  </p>
                </div>
                <button 
                  onClick={closeModal} 
                  className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  data-testid="close-category-modal"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Image Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`upload-zone mb-6 ${isDragging ? 'active' : ''} ${uploading ? 'uploading' : ''} ${errors.image && touched.image && !formData.image ? 'border-red-500 bg-red-900/30' : ''}`}
              data-testid="category-upload-zone"
            >
              {uploading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-4">
                  <div className="relative">
                    <div className="animate-spin h-10 w-10 border-3 border-emerald-500 border-t-transparent rounded-full"></div>
                    <div className="absolute inset-0 animate-ping h-10 w-10 border border-emerald-500 rounded-full opacity-20"></div>
                  </div>
                  <span className="text-emerald-400 font-medium">Завантаження...</span>
                </div>
              ) : formData.image ? (
                <div className="relative group">
                  <img 
                    src={getImageUrl(formData.image)} 
                    alt="Preview" 
                    className="w-full h-40 object-cover rounded-xl transition-transform group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <button
                      type="button"
                      onClick={removeImage}
                      className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all hover:scale-110"
                      data-testid="remove-category-image"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
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
                    accept="image/*"
                    onChange={(e) => handleFile(e.target.files[0])}
                    className="hidden"
                    id="categoryFileUpload"
                  />
                  <label 
                    htmlFor="categoryFileUpload" 
                    className="inline-block px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl cursor-pointer transition-all hover:scale-105 active:scale-95 font-semibold"
                  >
                    Обрати файл
                  </label>
                  <p className="text-xs text-gray-500 mt-3">
                    JPG, PNG • Рекомендований розмір 800x600
                  </p>
                </>
              )}
            </div>
            {errors.image && touched.image && !formData.image && (
              <div className="error-message mb-4">
                <AlertCircle size={14} />
                {errors.image}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="modal-label required">Назва категорії</label>
                <input
                  type="text"
                  placeholder="Введіть назву категорії"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={`modal-input ${errors.name && touched.name ? 'error' : ''} ${touched.name && !errors.name && formData.name ? 'success' : ''}`}
                  data-testid="category-name-input"
                />
                {errors.name && touched.name && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    {errors.name}
                  </div>
                )}
              </div>

              {/* Count */}
              <div>
                <label className="modal-label">Кількість товарів</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.count}
                  onChange={(e) => handleFieldChange('count', parseInt(e.target.value) || 0)}
                  className="modal-input"
                  data-testid="category-count-input"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Автоматично оновлюється при додаванні товарів
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 modal-btn-primary"
                  data-testid="save-category-btn"
                >
                  {editingCategory ? 'Зберегти зміни' : 'Створити категорію'}
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

export default AdminCategories;
