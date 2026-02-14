import React, { useState } from "react";
import { LayoutGrid, ChevronRight } from "lucide-react";
import Hero from "../components/Hero";
import ProductSection from "../components/ProductSection";
import CatalogModal from "../components/CatalogModal";

const HomePage = () => {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <Hero />

      {/* Catalog Button */}
      <div className="max-w-7xl mx-auto px-4 pt-8 lg:pt-12 pb-6">
        <button
          onClick={() => setIsCatalogOpen(true)}
          className="
            w-full lg:w-auto lg:px-12
            bg-gradient-to-r from-green-500 to-emerald-600 
            hover:from-green-600 hover:to-emerald-700
            text-white py-4 lg:py-5 rounded-2xl 
            font-bold text-lg lg:text-xl 
            flex items-center justify-center gap-3 
            transition-all duration-300 
            shadow-lg shadow-green-500/30
            hover:shadow-xl hover:shadow-green-500/40
            hover:-translate-y-0.5
            active:scale-[0.98]
            group
          "
        >
          <LayoutGrid className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          Каталог рослин
          <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Products Section */}
      <ProductSection />

      {/* Spacer */}
      <div className="h-8" />

      <CatalogModal isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />
    </div>
  );
};

export default HomePage;
