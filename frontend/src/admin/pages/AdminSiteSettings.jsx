import React, { useState, useEffect } from 'react';
import { Save, Upload, X, Loader2, Plus, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import AdminLayout from '../components/AdminLayout';
import { toast } from 'sonner';
import { getSiteSettings, saveSiteSettings, uploadImage, getImageUrl } from '../api/adminApi';
import { useSettings } from '../../context/SettingsContext';

const AdminSiteSettings = () => {
  const { theme } = useTheme();
  const { refreshSettings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadingSlideIndex, setUploadingSlideIndex] = useState(null);
  
  const [settings, setSettings] = useState({
    heroSlides: [
      { id: 1, image: 'https://images.unsplash.com/photo-1494825514961-674db1ac2700', title: 'PlatanSad', subtitle: 'Професійний розсадник рослин', active: true },
      { id: 2, image: 'https://images.prom.ua/6510283244_w640_h640_bonsaj-nivaki-pinus.jpg', title: 'Бонсай Нівакі', subtitle: 'Японський стиль для вашого саду', active: true },
      { id: 3, image: 'https://images.prom.ua/5107353705_w640_h640_tuya-smaragd-smaragd.jpg', title: 'Туя Смарагд', subtitle: 'Ідеальний живопліт', active: true },
      { id: 4, image: 'https://images.prom.ua/713633902_w640_h640_hvojni-roslini.jpg', title: 'Хвойні рослини', subtitle: 'Вічнозелена краса', active: true },
    ],
    topBanner: { text: '🎉 Знижка 20% на всі туї до кінця місяця!', active: false, color: '#10b981' },
  });

  // Зберігаємо інші налаштування, щоб не втратити їх при збереженні
  const [otherSettings, setOtherSettings] = useState({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setInitialLoading(true);
    try {
      const data = await getSiteSettings();
      if (data.settings_data) {
        // Зберігаємо всі інші налаштування
        const { heroSlides, topBanner, ...rest } = data.settings_data;
        setOtherSettings(rest);
        
        // Встановлюємо тільки heroSlides та topBanner
        setSettings({
          heroSlides: heroSlides || settings.heroSlides,
          topBanner: topBanner || settings.topBanner,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Помилка завантаження налаштувань');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Об'єднуємо з іншими налаштуваннями
      const fullSettings = {
        ...otherSettings,
        heroSlides: settings.heroSlides,
        topBanner: settings.topBanner,
      };
      
      await saveSiteSettings(fullSettings);
      refreshSettings();
      toast.success('✅ Налаштування успішно збережені!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('❌ Помилка збереження');
    } finally {
      setLoading(false);
    }
  };

  const updateSlide = (index, field, value) => {
    const newSlides = [...settings.heroSlides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSettings(prev => ({ ...prev, heroSlides: newSlides }));
  };

  const addSlide = () => {
    const newSlide = {
      id: Date.now(),
      image: '',
      title: 'Новий слайд',
      subtitle: 'Опис слайду',
      active: true
    };
    setSettings(prev => ({ ...prev, heroSlides: [...prev.heroSlides, newSlide] }));
  };

  const deleteSlide = (index) => {
    setSettings(prev => ({
      ...prev,
      heroSlides: prev.heroSlides.filter((_, i) => i !== index)
    }));
  };

  const handleSlideImageUpload = async (index, file) => {
    if (!file) return;
    
    setUploadingSlideIndex(index);
    try {
      const result = await uploadImage(file);
      const imageUrl = getImageUrl(result.url);
      updateSlide(index, 'image', imageUrl);
      toast.success('Зображення завантажено!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Помилка завантаження зображення');
    } finally {
      setUploadingSlideIndex(null);
    }
  };

  if (initialLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={`p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Hero Слайдер
              </h1>
              <p className="text-gray-400 mt-1">Налаштуйте слайди на головній сторінці</p>
            </div>
            <button
              onClick={handleSave}
              disabled={loading}
              data-testid="save-settings-btn"
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 shadow-md"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Збереження...' : 'Зберегти все'}
            </button>
          </div>

          {/* Hero Slides */}
          <div className="bg-[#0f1a2b] rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <ImageIcon className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  Слайди ({settings.heroSlides.length})
                </h2>
              </div>
              <button
                onClick={addSlide}
                data-testid="add-slide-btn"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Додати слайд
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Завантажуйте зображення для слайдера. Зміни відображаються на сайті в реальному часі після збереження.
            </p>
            <div className="space-y-6">
              {settings.heroSlides.map((slide, index) => (
                <div key={slide.id} data-testid={`slide-${index}`} className="p-4 border-2 border-gray-700 rounded-xl bg-gray-800/50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-white text-lg">
                      Слайд #{index + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={slide.active}
                          onChange={(e) => updateSlide(index, 'active', e.target.checked)}
                          data-testid={`slide-${index}-active`}
                          className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-300">Активний</span>
                      </label>
                      {settings.heroSlides.length > 1 && (
                        <button
                          onClick={() => deleteSlide(index)}
                          data-testid={`slide-${index}-delete`}
                          className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 text-sm border border-red-600/30"
                        >
                          Видалити
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Image Upload Section */}
                    <div className="lg:col-span-1">
                      <label className="block text-sm font-medium mb-2 text-gray-300">
                        Зображення слайда
                      </label>
                      <div className="relative">
                        {slide.image ? (
                          <div className="relative group">
                            <img
                              src={slide.image}
                              alt={slide.title}
                              className="w-full h-40 object-cover rounded-lg border-2 border-gray-600"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="hidden w-full h-40 bg-gray-700 rounded-lg border-2 border-gray-600 items-center justify-center">
                              <span className="text-gray-400 text-sm">Помилка завантаження</span>
                            </div>
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                              <label className="cursor-pointer px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2">
                                {uploadingSlideIndex === index ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Upload className="w-4 h-4" />
                                )}
                                Замінити
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleSlideImageUpload(index, e.target.files[0])}
                                  disabled={uploadingSlideIndex === index}
                                />
                              </label>
                              <button
                                onClick={() => updateSlide(index, 'image', '')}
                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="cursor-pointer block">
                            <div className="w-full h-40 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-green-500 hover:bg-gray-700/50 transition-all">
                              {uploadingSlideIndex === index ? (
                                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                              ) : (
                                <>
                                  <Upload className="w-8 h-8 text-gray-400" />
                                  <span className="text-gray-400 text-sm">Завантажити зображення</span>
                                </>
                              )}
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              data-testid={`slide-${index}-upload`}
                              onChange={(e) => handleSlideImageUpload(index, e.target.files[0])}
                              disabled={uploadingSlideIndex === index}
                            />
                          </label>
                        )}
                      </div>
                      {/* URL Input as fallback */}
                      <div className="mt-2">
                        <input
                          type="url"
                          value={slide.image}
                          onChange={(e) => updateSlide(index, 'image', e.target.value)}
                          placeholder="або вставте URL зображення"
                          data-testid={`slide-${index}-image-url`}
                          className="w-full px-3 py-2 rounded-lg border bg-gray-700 border-gray-600 text-white text-sm placeholder-gray-500"
                        />
                      </div>
                    </div>
                    
                    {/* Text Content Section */}
                    <div className="lg:col-span-2 space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                          Заголовок
                        </label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => updateSlide(index, 'title', e.target.value)}
                          placeholder="Заголовок слайда"
                          data-testid={`slide-${index}-title`}
                          className="w-full px-4 py-3 rounded-lg border bg-gray-700 border-gray-600 text-white text-lg font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                          Підзаголовок
                        </label>
                        <input
                          type="text"
                          value={slide.subtitle}
                          onChange={(e) => updateSlide(index, 'subtitle', e.target.value)}
                          placeholder="Короткий опис"
                          data-testid={`slide-${index}-subtitle`}
                          className="w-full px-4 py-3 rounded-lg border bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Banner */}
          <div className="bg-[#0f1a2b] rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
              🎯 Верхній банер (акційний)
            </h2>
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.topBanner.active}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    topBanner: { ...prev.topBanner, active: e.target.checked }
                  }))}
                  data-testid="banner-active"
                  className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-300">Показувати банер</span>
              </label>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Текст банеру
                </label>
                <input
                  type="text"
                  value={settings.topBanner.text}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    topBanner: { ...prev.topBanner, text: e.target.value }
                  }))}
                  data-testid="banner-text"
                  className="w-full px-4 py-2 rounded-lg border bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Колір банеру
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.topBanner.color}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        topBanner: { ...prev.topBanner, color: e.target.value }
                      }))}
                      data-testid="banner-color"
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.topBanner.color}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        topBanner: { ...prev.topBanner, color: e.target.value }
                      }))}
                      className="w-28 px-3 py-2 rounded-lg border bg-gray-700 border-gray-600 text-white text-sm"
                    />
                  </div>
                </div>
                {/* Preview */}
                {settings.topBanner.text && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Попередній перегляд
                    </label>
                    <div
                      style={{ backgroundColor: settings.topBanner.color }}
                      className="px-4 py-2 rounded-lg text-white text-center text-sm font-medium"
                    >
                      {settings.topBanner.text}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSiteSettings;
