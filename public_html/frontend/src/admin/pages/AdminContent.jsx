import React, { useState, useEffect } from 'react';
import { Save, FileText, Truck, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import AdminLayout from '../components/AdminLayout';
import { toast } from 'sonner';
import { getSiteSettings, saveSiteSettings } from '../api/adminApi';

const AdminContent = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  const [content, setContent] = useState({
    aboutTitle: 'Про нас',
    aboutText: '',
    deliveryTitle: 'Доставка та оплата',
    deliveryText: '',
    returnTitle: 'Повернення та обмін',
    returnText: '',
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setInitialLoading(true);
    try {
      const data = await getSiteSettings();
      if (data.settings_data) {
        setContent({
          aboutTitle: data.settings_data.aboutTitle || 'Про нас',
          aboutText: data.settings_data.aboutText || '',
          deliveryTitle: data.settings_data.deliveryTitle || 'Доставка та оплата',
          deliveryText: data.settings_data.deliveryText || '',
          returnTitle: data.settings_data.returnTitle || 'Повернення та обмін',
          returnText: data.settings_data.returnText || '',
        });
      }
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Помилка завантаження контенту');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const currentSettings = await getSiteSettings();
      const updatedSettings = {
        ...currentSettings.settings_data,
        ...content
      };
      await saveSiteSettings(updatedSettings);
      toast.success('✅ Контент успішно збережено!');
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('❌ Помилка збереження');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const tabs = [
    { id: 'about', label: 'Про нас', icon: FileText },
    { id: 'delivery', label: 'Доставка', icon: Truck },
    { id: 'return', label: 'Повернення', icon: RefreshCw },
  ];

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
      <div className={`p-4 sm:p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Управління контентом
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Редагування текстів статичних сторінок
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Збереження...' : 'Зберегти'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-600 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
          {activeTab === 'about' && (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  Заголовок
                </label>
                <input
                  type="text"
                  value={content.aboutTitle}
                  onChange={(e) => handleChange('aboutTitle', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  Текст (підтримує HTML)
                </label>
                <textarea
                  value={content.aboutText}
                  onChange={(e) => handleChange('aboutText', e.target.value)}
                  rows={12}
                  placeholder="Розкажіть про ваш розсадник, історію, місію..."
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm`}
                />
              </div>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  Заголовок
                </label>
                <input
                  type="text"
                  value={content.deliveryTitle}
                  onChange={(e) => handleChange('deliveryTitle', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  Текст (підтримує HTML)
                </label>
                <textarea
                  value={content.deliveryText}
                  onChange={(e) => handleChange('deliveryText', e.target.value)}
                  rows={12}
                  placeholder="Опишіть умови доставки, способи оплати, терміни..."
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm`}
                />
              </div>
            </div>
          )}

          {activeTab === 'return' && (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  Заголовок
                </label>
                <input
                  type="text"
                  value={content.returnTitle}
                  onChange={(e) => handleChange('returnTitle', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  Текст (підтримує HTML)
                </label>
                <textarea
                  value={content.returnText}
                  onChange={(e) => handleChange('returnText', e.target.value)}
                  rows={12}
                  placeholder="Опишіть політику повернення та обміну товарів..."
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm`}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminContent;
