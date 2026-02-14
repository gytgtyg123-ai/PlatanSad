import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const ContactsPage = () => {
  const { settings } = useSettings();

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Compact Hero */}
      <div className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 text-white py-10 sm:py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
            Контакти
          </h1>
          <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            Ми завжди раді відповісти на ваші запитання
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
        {/* Contact Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Телефон */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
            <div className="bg-green-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2">
              Телефон
            </h3>
            <a
              href={`tel:${(settings?.phone1 || '+380636507449').replace(/\s/g, '')}`}
              className="block text-green-600 font-medium text-xs sm:text-sm hover:underline"
            >
              {settings?.phone1 || '+380 (63) 650-74-49'}
            </a>
            <a
              href={`tel:${(settings?.phone2 || '+380952510347').replace(/\s/g, '')}`}
              className="block text-green-600 font-medium text-xs sm:text-sm hover:underline"
            >
              {settings?.phone2 || '+380 (95) 251-03-47'}
            </a>
          </div>

          {/* Email */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
            <div className="bg-green-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2">
              Email
            </h3>
            <a
              href={`mailto:${settings?.email || 'info@platansad.ua'}`}
              className="text-green-600 font-medium text-xs sm:text-sm hover:underline break-all"
            >
              {settings?.email || 'info@platansad.ua'}
            </a>
          </div>

          {/* Адреса */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
            <div className="bg-green-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2">
              Адреса
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              {settings?.address || 'Смига'}
            </p>
          </div>

          {/* Графік роботи */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
            <div className="bg-green-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2">
              Графік роботи
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Пн-Пт: 8:00-17:00
            </p>
            <p className="text-gray-600 text-xs sm:text-sm">
              Сб-Нд: вихідний
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;