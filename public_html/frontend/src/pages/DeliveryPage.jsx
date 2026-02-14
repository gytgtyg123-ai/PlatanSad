import React from 'react';
import { CreditCard, Truck, CheckCircle, AlertTriangle, MapPin } from 'lucide-react';

const DeliveryPage = () => {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Compact Hero */}
      <div className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 text-white py-10 sm:py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
            Оплата і доставка
          </h1>
          <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            Вся інформація про способи оплати та доставки товарів
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-10">
          
          {/* Способи оплати */}
          <div className="mb-6 sm:mb-10">
            <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              Способи оплати
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
                <h3 className="font-bold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">Готівка при отриманні</h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Оплата здійснюється при отриманні товару в офісі служби доставки або кур'єру.
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
                <h3 className="font-bold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">Безготівковий розрахунок</h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Оплата на карту або через електронні платіжні системи.
                </p>
              </div>
            </div>
          </div>

          {/* Інфо блок - зелений */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-5 mb-3 sm:mb-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base">
                  Копаємо і відправляємо щодня в порядку живої черги
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Терміни очікування: <strong>2–6 робочих днів</strong>{' '}
                  <span className="text-amber-600">(залежить від сезону та завантаженості)</span>
                </p>
              </div>
            </div>
          </div>

          {/* Нова Пошта - білий блок */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mb-3 sm:mb-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <Truck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">Нова Пошта</h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">
                  Доставка обов'язково у вантажне відділення Нової Пошти (200–1100 кг)
                </p>
                <div className="space-y-1 sm:space-y-1.5">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span>Терміни доставки: <strong>3–6 робочих днів</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span>Вартість: за тарифами Нової Пошти</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Важливо - жовтий блок */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 mb-3 sm:mb-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">Важливо знати перед отриманням:</h3>
                <div className="space-y-1 sm:space-y-1.5">
                  <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                    <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Перевірте рослини на цілісність під час отримання</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                    <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Рослини пакуються вручну для безпечного транспортування</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                    <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Після відправлення ви отримаєте номер накладної</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Кур'єрська доставка - білий блок */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mb-3 sm:mb-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <Truck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">Кур'єрська доставка</h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">
                  Доставка за вказаною адресою (доступно для великих міст)
                </p>
                <div className="space-y-1 sm:space-y-1.5">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span>1–2 дні</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span>Вартість індивідуальна</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Самовивіз - білий блок */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
            <div className="flex items-start gap-2 sm:gap-3">
              <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">Самовивіз</h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">
                  Забрати замовлення можна з нашого розсадника за попередньою домовленістю. Копати на місці наразі немає можливості через велику завантаженість
                </p>
                <div className="space-y-1 sm:space-y-1.5">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span>Безкоштовно</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span>Пн–Нд 8:00–17:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DeliveryPage;