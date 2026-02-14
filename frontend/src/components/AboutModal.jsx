import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Sprout, Truck, Award, Users } from "lucide-react";

const AboutModal = ({ isOpen, onClose }) => {
  const panelRef = useRef(null);
  const navigate = useNavigate();

  // Counters
  const [years, setYears] = useState(0);
  const [pines, setPines] = useState(0);

  // Lock body scroll + Esc close + focus first element
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);

    // focus close button for mobile accessibility
    setTimeout(() => {
      const btn = panelRef.current?.querySelector("[data-close]");
      btn?.focus?.();
    }, 0);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  // Animate counters on open
  useEffect(() => {
    if (!isOpen) return;

    setYears(0);
    setPines(0);

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setYears(20);
      setPines(200);
      return;
    }

    const start = performance.now();
    const duration = 900;
    const yTarget = 20;
    const pTarget = 200;

    let raf = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);

      setYears(Math.round(yTarget * eased));
      setPines(Math.round(pTarget * eased));

      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  if (!isOpen) return null;

  const goToCatalog = () => {
    onClose?.();
    navigate("/catalog");
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Про PlatanSad"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={panelRef}
        className={[
          "relative w-full sm:max-w-3xl bg-white shadow-2xl overflow-hidden",
          "rounded-t-3xl sm:rounded-2xl",
          "max-h-[92vh] sm:max-h-[90vh]",
          "animate-slideUp sm:animate-fadeIn",
        ].join(" ")}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-4 sm:p-6 relative">
          <div className="pr-12">
            <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold leading-tight">
              Ділимось тим, що вирощуємо з любов’ю
            </h2>
            <p className="text-green-100 text-xs sm:text-sm md:text-base mt-1">
              Зазирніть за лаштунки Platansad
            </p>
          </div>

          <button
            data-close
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
            aria-label="Закрити"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-4 sm:p-8 overflow-y-auto max-h-[calc(92vh-86px)] sm:max-h-[calc(90vh-120px)]">
          {/* Intro */}
          <div className="mb-5">
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg">
              <strong className="text-green-600">PlatanSad</strong> — це місце, де
              любов до рослин поєднується з досвідом та якістю. Ми допомагаємо
              створювати сади, які тішать роками — від першої посадки до
              сформованого ландшафту.
            </p>
          </div>

          {/* What we offer */}
          <div className="mb-6">
            <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-800 mb-3 sm:mb-4">
              Що ви знайдете у нас?
            </h3>

            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <Sprout className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">
                      Нівакі та формовані дерева
                    </p>

                    {/* Pulsing counter */}
                    <div className="shrink-0 rounded-full bg-green-600 text-white px-3 py-1 text-xs sm:text-sm font-extrabold animate-pulse">
                      {pines}+
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Понад {pines}+ сформованих сосен з правильною кроною
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Why choose us */}
          <div className="mb-6">
            <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-800 mb-3 sm:mb-4">
              Чому обирають нас?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-4 bg-green-50 rounded-2xl flex gap-3">
                <Award className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-800 text-sm sm:text-base">
                    Понад {years} років досвіду
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Дорослі, власно вирощені рослини з правильною кореневою системою
                  </p>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-2xl flex gap-3">
                <Users className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-800 text-sm sm:text-base">
                    Живі консультації
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Підкажемо, що саме підійде для вашої ділянки
                  </p>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-2xl flex gap-3 sm:col-span-2">
                <Truck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-800 text-sm sm:text-base">
                    Надійна доставка
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Акуратне пакування та відправка рослин по всій Україні
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl overflow-hidden border border-green-700/10">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-4 sm:p-5 text-center text-white">
              <h3 className="text-base sm:text-lg font-extrabold mb-1">
                Ділимось тим, що вирощуємо з любов’ю
              </h3>
              <p className="text-green-100 text-xs sm:text-sm mb-3">
                Зазирніть за лаштунки Platansad
              </p>

              <button
                onClick={goToCatalog}
                className="w-full sm:w-auto bg-white text-green-700 px-6 py-2.5 rounded-xl font-extrabold hover:bg-green-50 active:scale-[0.99] transition"
              >
                Перейти до каталогу
              </button>
            </div>
          </div>

          <div className="h-2 sm:hidden" />
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
