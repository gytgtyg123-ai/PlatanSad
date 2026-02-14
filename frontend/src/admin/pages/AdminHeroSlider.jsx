import React, { useState, useEffect } from 'react';
import { Save, Upload, X, Loader2, Plus, Image as ImageIcon, Leaf, Sparkles, LogOut, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { getSiteSettings, saveSiteSettings, uploadImage, getImageUrl } from '../api/adminApi';

const AdminHeroSlider = () => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadingSlideIndex, setUploadingSlideIndex] = useState(null);
  
  const [settings, setSettings] = useState({
    heroSlides: [
      { id: 1, image: '', title: 'PlatanSad', subtitle: 'Професійний розсадник рослин', active: true },
    ],
    topBanner: { text: '', active: false, color: '#10b981' },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setInitialLoading(true);
    try {
      const data = await getSiteSettings();
      if (data.settings_data) {
        setSettings(prev => ({
          ...prev,
          heroSlides: data.settings_data.heroSlides || prev.heroSlides,
          topBanner: data.settings_data.topBanner || prev.topBanner,
        }));
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
      // Get existing settings first to preserve other data
      const existingData = await getSiteSettings();
      const mergedSettings = {
        ...(existingData.settings_data || {}),
        heroSlides: settings.heroSlides,
        topBanner: settings.topBanner,
      };
      
      await saveSiteSettings(mergedSettings);
      toast.success('✅ Налаштування слайдера збережені!');
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

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
  };

  if (initialLoading) {
    return (
      <div className="dark min-h-screen bg-[#080d14] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-[#080d14] text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0d1520]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 lg:px-8 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-black text-white tracking-tight">PlatanSad</div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400/80">
                <Sparkles size={10} />
                <span>Hero Слайдер</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-medium transition-all"
            >
              <ExternalLink size={16} />
              На сайт
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 font-medium transition-all"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Вийти</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 lg:p-8 max-w-6xl mx-auto">
        {/* Save Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Управління Hero Слайдером</h1>
            <p className="text-gray-400 mt-1">Налаштуйте слайди на головній сторінці</p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            data-testid="save-settings-btn"
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 shadow-lg shadow-green-600/30"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Збереження...' : 'Зберегти'}
          </button>
        </div>

        {/* Hero Slides */}
        <div className="bg-[#0f1a2b] rounded-xl shadow-xl p-6 mb-6 border border-white/5">
          <div className="flex items-center justify-between mb-6">
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
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Додати слайд
            </button>
          </div>
          
          <div className="space-y-6">
            {settings.heroSlides.map((slide, index) => (
              <div 
                key={slide.id} 
                data-testid={`slide-${index}`}
                className="p-5 border-2 border-gray-700/50 rounded-xl bg-gray-800/30 hover:border-emerald-500/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-white text-lg flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm">
                      {index + 1}
                    </span>
                    Слайд #{index + 1}
                  </span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slide.active}
                        onChange={(e) => updateSlide(index, 'active', e.target.checked)}
                        data-testid={`slide-${index}-active`}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500"
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
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Image Upload Section */}
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Зображення
                    </label>
                    <div className="relative">
                      {slide.image ? (
                        <div className="relative group">
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-44 object-cover rounded-lg border-2 border-gray-600"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden w-full h-44 bg-gray-700 rounded-lg border-2 border-gray-600 items-center justify-center">
                            <span className="text-gray-400 text-sm">Помилка завантаження</span>
                          </div>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                            <label className="cursor-pointer px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm flex items-center gap-2">
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
                          <div className="w-full h-44 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:bg-gray-700/50 transition-all">
                            {uploadingSlideIndex === index ? (
                              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-gray-400" />
                                <span className="text-gray-400 text-sm">Завантажити</span>
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
                    <div className="mt-2">
                      <input
                        type="url"
                        value={slide.image}
                        onChange={(e) => updateSlide(index, 'image', e.target.value)}
                        placeholder="або вставте URL"
                        data-testid={`slide-${index}-image-url`}
                        className="w-full px-3 py-2 rounded-lg border bg-gray-700 border-gray-600 text-white text-sm placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                        className="w-full px-4 py-3 rounded-lg border bg-gray-700 border-gray-600 text-white text-lg font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                        className="w-full px-4 py-3 rounded-lg border bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Banner */}
        <div className="bg-[#0f1a2b] rounded-xl shadow-xl p-6 border border-white/5">
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
                className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500"
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
                placeholder="🎉 Знижка 20% на всі туї!"
                className="w-full px-4 py-2 rounded-lg border bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
                    className="w-12 h-10 rounded cursor-pointer border border-gray-600"
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
                <div className="flex-1 w-full sm:w-auto">
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
      </main>

      {/* Footer */}
      <footer className="px-4 lg:px-8 py-4 border-t border-white/5 mt-8">
        <div className="flex items-center justify-between text-xs text-gray-500 max-w-6xl mx-auto">
          <span>© 2024 PlatanSad. Всі права захищені.</span>
          <span className="flex items-center gap-1">
            <Leaf size={12} className="text-emerald-500" />
            Розсадник декоративних рослин
          </span>
        </div>
      </footer>

      {/* Background effects */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-500/[0.03] rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
};

export default AdminHeroSlider;
