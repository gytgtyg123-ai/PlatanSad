import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPublicSettings } from '../api/settingsApi';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getPublicSettings();
      setSettings(data.settings_data);
    } catch (error) {
      console.error('Error loading settings:', error);
      // Set default settings on error - don't block the app
      setSettings({
        phone1: '+380 (63) 650-74-49',
        phone2: '+380 (95) 251-03-47',
        email: 'info@platansad.ua',
        viber: '+380636507449',
        address: 'Рівненська обл., Дубенський р-н, смт. Смига',
        workingHours: 'Пн-Сб: 9:00-18:00',
        weekend: 'Нд: вихідний',
        instagram: 'https://www.instagram.com/platansad.uaa?igsh=cmhhbG4zbjNkMTBr',
        tiktok: 'https://www.tiktok.com/@platansad.ua?_r=1&_t=ZM-939QCCJ5tAx',
        facebook: '',
        youtube: '',
        siteName: 'PlatanSad',
        siteDescription: 'Професійний розсадник рослин в Україні',
        siteKeywords: 'розсадник, рослини, туя, бонсай, хвойні',
        heroSlides: [
          { id: 1, image: 'https://images.unsplash.com/photo-1494825514961-674db1ac2700', title: 'PlatanSad', subtitle: 'Професійний розсадник рослин', active: true },
          { id: 2, image: 'https://images.prom.ua/6510283244_w640_h640_bonsaj-nivaki-pinus.jpg', title: 'Бонсай Нівакі', subtitle: 'Японський стиль для вашого саду', active: true },
          { id: 3, image: 'https://images.prom.ua/5107353705_w640_h640_tuya-smaragd-smaragd.jpg', title: 'Туя Смарагд', subtitle: 'Ідеальний живопліт', active: true },
          { id: 4, image: 'https://images.prom.ua/713633902_w640_h640_hvojni-roslini.jpg', title: 'Хвойні рослини', subtitle: 'Вічнозелена краса', active: true }
        ],
        topBanner: { text: '🎉 Знижка 20% на всі туї до кінця місяця!', active: false, color: '#10b981' },
        deliveryText: 'Ми працюємо з Новою Поштою. Безкоштовна доставка при замовленні від 1000₴.',
        paymentText: 'Приймаємо оплату: накладений платіж, LiqPay (Visa/Mastercard).',
        returnPolicy: 'Повернення та обмін товару протягом 14 днів.',
        freeDeliveryFrom: 1000,
        firstOrderDiscount: 0,
        bulkOrderDiscount: 0,
        primaryColor: '#10b981',
        secondaryColor: '#059669',
        accentColor: '#f59e0b',
        orderNotificationEmail: 'orders@platansad.ua',
        supportEmail: 'support@platansad.ua',
        currency: '₴',
        language: 'uk',
        timezone: 'Europe/Kiev',
        showStock: true,
        showReviews: true
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = () => {
    loadSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
