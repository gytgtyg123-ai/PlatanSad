import React from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock, Info, Phone } from 'lucide-react';

const ReturnPage = () => {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Compact Hero */}
      <div className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 text-white py-10 sm:py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
            Обмін та повернення
          </h1>
          <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            Умови обміну рослини або повернення коштів
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-10">
          
          {/* Коли можливий обмін */}
          <div className="mb-6 sm:mb-8">
            <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
              <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              Коли можливий обмін або повернення коштів
            </h2>
            
            <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
              Обмін рослини або повернення коштів можливі виключно у разі, якщо:
            </p>
            
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-xs sm:text-sm">рослина була пошкоджена під час транспортування;</span>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-xs sm:text-sm">отриманий товар не відповідає замовленню (інший сорт або розмір);</span>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-xs sm:text-sm">рослина прибула у критично незадовільному стані.</span>
              </div>
            </div>

            {/* Info блок */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-5">
              <div className="flex items-start gap-2 sm:gap-3">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-xs sm:text-sm">
                  Рішення щодо обміну або компенсації приймається індивідуально після розгляду звернення.
                </span>
              </div>
            </div>
          </div>

          {/* Дві колонки - умови */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Обов'язкові умови розгляду */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
              <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                Обов'язкові умови розгляду
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span className="text-gray-600 text-xs sm:text-sm">повідомлення протягом 24 годин з моменту отримання замовлення;</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span className="text-gray-600 text-xs sm:text-sm">надання фото або відео матеріалів, зроблених у відділенні служби доставки або одразу після отримання;</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span className="text-gray-600 text-xs sm:text-sm">рослина не була висаджена або пересаджена.</span>
                </div>
              </div>
            </div>

            {/* Коли звернення не розглядається */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
              <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                Коли звернення не розглядається
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">×</span>
                  <span className="text-gray-600 text-xs sm:text-sm">минуло більше 24 годин з моменту отримання замовлення;</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">×</span>
                  <span className="text-gray-600 text-xs sm:text-sm">відсутні фото або відео матеріали, зроблені у відділенні служби доставки або одразу після отримання;</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">×</span>
                  <span className="text-gray-600 text-xs sm:text-sm">рослина була висаджена або пересаджена.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Як подати звернення */}
          <div className="mb-6 sm:mb-8">
            <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              Як подати звернення
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[
                { num: '1', title: "Зв'яжіться з нами", desc: 'Напишіть або зателефонуйте протягом 24 годин після отримання.' },
                { num: '2', title: 'Додайте докази', desc: 'Надайте фото/відео з відділення доставки або одразу після отримання.' },
                { num: '3', title: 'Не висаджуйте', desc: 'Не висаджуйте та не пересаджуйте рослину до розгляду звернення.' },
                { num: '4', title: 'Рішення', desc: 'Ми індивідуально розглянемо звернення та повідомимо результат.' },
              ].map((step, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 text-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <span className="text-green-600 font-bold text-sm sm:text-base">{step.num}</span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-1 sm:mb-2 text-xs sm:text-sm">{step.title}</h4>
                  <p className="text-gray-500 text-[10px] sm:text-xs leading-tight">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Маєте запитання */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5">
            <h3 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">Маєте запитання?</h3>
            <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
              Зателефонуйте нам — допоможемо по зверненню щодо обміну або компенсації.
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <a 
                href="tel:+380636507449" 
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm font-medium"
              >
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                +380 (63) 650-74-49
              </a>
              <a 
                href="tel:+380952510347" 
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm font-medium"
              >
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                +380 (95) 251-03-47
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReturnPage;
