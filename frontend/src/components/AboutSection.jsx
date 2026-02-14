import React from 'react';
import { MapPin, Truck, Package, Award, TreePine, TreeDeciduous, ShieldCheck, Leaf } from 'lucide-react';

const AboutSection = () => {
  return (
    <section className="bg-gradient-to-b from-white to-green-50 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Compact info block - Hidden on mobile, visible on desktop */}
        <div className="hidden md:block bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-6">
            <span className="text-green-600">PlatanSad</span> — розсадник якісних акліматизованих рослин
          </h2>
          
          {/* Features grid - compact */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <TreePine className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-800">Хвойні рослини</p>
            </div>
            <div className="text-center p-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <TreeDeciduous className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-800">Листяні рослини</p>
            </div>
            <div className="text-center p-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-800">Акліматизовані</p>
            </div>
            <div className="text-center p-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-800">18+ років досвіду</p>
            </div>
          </div>

          {/* Key info - horizontal on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
              <MapPin className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-gray-700">Смт. Смига, Рівненська обл.</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
              <Truck className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-gray-700">Нова Пошта / Самовивіз</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
              <Package className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-gray-700">Безкоштовне пакування</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;