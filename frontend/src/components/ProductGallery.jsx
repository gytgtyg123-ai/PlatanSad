import React, { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

const ProductGallery = ({ images = [], mainImage, productName }) => {
  // Combine main image with additional images, filter duplicates
  const allImages = React.useMemo(() => {
    const imgs = [mainImage, ...images].filter(Boolean).map(img => getImageUrl(img));
    return [...new Set(imgs)].slice(0, 5);
  }, [mainImage, images]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    dragFree: false,
    containScroll: 'trimSnaps'
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  if (allImages.length === 0) return null;

  // Single image - no carousel
  if (allImages.length === 1) {
    return (
      <div className="relative w-full max-w-lg aspect-square bg-white rounded-xl shadow-sm overflow-hidden">
        <img
          src={allImages[0]}
          alt={productName}
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      {/* Main Carousel */}
      <div className="relative bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {allImages.map((img, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 aspect-square">
                <img
                  src={img}
                  alt={`${productName} - фото ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows - hidden on mobile, visible on desktop */}
        <button
          onClick={scrollPrev}
          className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-lg transition-all z-10"
          aria-label="Попереднє фото"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <button
          onClick={scrollNext}
          className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-lg transition-all z-10"
          aria-label="Наступне фото"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>

        {/* Dots indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {allImages.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === selectedIndex 
                  ? 'bg-green-600 w-6' 
                  : 'bg-white/70 hover:bg-white'
              }`}
              aria-label={`Фото ${index + 1}`}
            />
          ))}
        </div>

        {/* Swipe hint for mobile */}
        <div className="md:hidden absolute bottom-10 left-1/2 -translate-x-1/2 text-xs text-white/80 bg-black/30 px-2 py-1 rounded-full pointer-events-none opacity-0 animate-fade-hint">
          ← Свайпніть →
        </div>
      </div>

      {/* Thumbnails - desktop only */}
      <div className="hidden md:flex gap-2 mt-3 justify-center">
        {allImages.map((img, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              index === selectedIndex 
                ? 'border-green-500 ring-2 ring-green-200' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <img
              src={img}
              alt={`Фото ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <style>{`
        @keyframes fadeHint {
          0%, 100% { opacity: 0; }
          10%, 90% { opacity: 1; }
        }
        .animate-fade-hint {
          animation: fadeHint 3s ease-in-out 1s 1;
        }
      `}</style>
    </div>
  );
};

export default ProductGallery;
