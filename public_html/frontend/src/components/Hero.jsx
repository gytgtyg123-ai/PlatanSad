import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSettings } from "../context/SettingsContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const Hero = () => {
  const { settings } = useSettings();

  const slides = useMemo(() => {
    const active = settings?.heroSlides?.filter((s) => s.active) || [];
    return active.length
      ? active
      : [
          {
            id: 1,
            image: "https://i.postimg.cc/CMJTz8mt/platansad.png",
            title: "",
            subtitle: "",
            active: true,
          },
          {
            id: 2,
            image: "https://i.postimg.cc/Pr1QygRp/platansad-(2).png",
            title: "PlatanSad",
            subtitle: "Преміальні нівакі для сучасного саду.",
            active: true,
          },
          {
            id: 3,
            image: "https://i.postimg.cc/sXq73mvs/platansad-(4).png",
            title: "",
            subtitle: "",
            active: true,
          },
        ];
  }, [settings?.heroSlides]);

  const len = slides.length;
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const wrapRef = useRef(null);
  const raf = useRef(null);
  const dragging = useRef(false);
  const lockAxis = useRef(null);

  const startX = useRef(0);
  const startY = useRef(0);
  const startT = useRef(0);

  const lastX = useRef(0);
  const lastT = useRef(0);

  const [dx, setDx] = useState(0);
  const [isSettling, setIsSettling] = useState(false);

  const [paused, setPaused] = useState(false);
  const resumeAtRef = useRef(0);

  const pauseTemporarily = (ms = 4500) => {
    resumeAtRef.current = Date.now() + ms;
  };

  const go = (i) => setIndex(((i % len) + len) % len);
  const next = () => setIndex((p) => (p + 1) % len);
  const prev = () => setIndex((p) => (p - 1 + len) % len);

  useEffect(() => {
    if (index >= len) setIndex(0);
  }, [len, index]);

  useEffect(() => {
    if (len <= 1) return;

    const t = setInterval(() => {
      const now = Date.now();
      if (paused || isSettling || isHovered || now < resumeAtRef.current) return;
      next();
    }, 5000);

    return () => clearInterval(t);
  }, [len, paused, isSettling, isHovered]);

  const scheduleDx = (value) => {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = null;
      setDx(value);
    });
  };

  const settleTo = (targetDx, cb) => {
    setIsSettling(true);
    setDx(targetDx);
    setTimeout(() => {
      cb?.();
      setIsSettling(false);
    }, 280);
  };

  const onPointerDown = (e) => {
    if (len <= 1) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    dragging.current = true;
    lockAxis.current = null;

    startX.current = e.clientX;
    startY.current = e.clientY;
    startT.current = performance.now();

    lastX.current = e.clientX;
    lastT.current = performance.now();

    setPaused(true);
    pauseTemporarily();
    setDx(0);

    try {
      wrapRef.current?.setPointerCapture?.(e.pointerId);
    } catch {}
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;

    const rawDx = e.clientX - startX.current;
    const rawDy = e.clientY - startY.current;

    if (!lockAxis.current) {
      const ax = Math.abs(rawDx);
      const ay = Math.abs(rawDy);
      if (ay > ax && ay > 10) lockAxis.current = "y";
      else if (ax > 10) lockAxis.current = "x";
    }

    if (lockAxis.current === "y") {
      dragging.current = false;
      setPaused(false);
      setDx(0);
      return;
    }

    lastX.current = e.clientX;
    lastT.current = performance.now();

    const w = wrapRef.current?.clientWidth || 1;
    const clamped = clamp(rawDx, -w * 0.45, w * 0.45);
    scheduleDx(clamped);

    e.preventDefault?.();
  };

  const onPointerUpOrCancel = () => {
    if (!dragging.current) {
      setPaused(false);
      return;
    }

    dragging.current = false;

    const w = wrapRef.current?.clientWidth || 1;
    const threshold = Math.max(40, w * 0.12);

    const vx =
      (lastX.current - startX.current) /
      (performance.now() - startT.current || 1);

    const fast = Math.abs(vx) > 0.55;

    if (dx > threshold || (fast && dx > 12)) {
      settleTo(w * 0.18, () => {
        prev();
        setDx(0);
      });
    } else if (dx < -threshold || (fast && dx < -12)) {
      settleTo(-w * 0.18, () => {
        next();
        setDx(0);
      });
    } else {
      settleTo(0, () => setDx(0));
    }

    pauseTemporarily();
    setPaused(false);
  };

  const prevIdx = (index - 1 + len) % len;
  const nextIdx = (index + 1) % len;

  const parallax = clamp(-dx * 0.08, -14, 14);

  return (
    <section className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 pt-2 sm:pt-4 lg:pt-6">
      <div 
        className="relative overflow-hidden rounded-none sm:rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={wrapRef}
          className="relative h-[220px] xs:h-[260px] sm:h-[320px] lg:h-[480px] xl:h-[540px] touch-pan-y bg-black"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUpOrCancel}
          onPointerCancel={onPointerUpOrCancel}
        >
          <div
            className="absolute inset-0 flex h-full w-[300%]"
            style={{
              transform: `translateX(calc(-33.3333% + ${dx}px))`,
              transition: isSettling
                ? "transform 280ms cubic-bezier(.16,1,.3,1)"
                : "none",
            }}
          >
            {[prevIdx, index, nextIdx].map((i, pos) => {
              const slide = slides[i];
              const isCenter = pos === 1;

              return (
                <div
                  key={`${slide.id}-${pos}`}
                  className="relative w-1/3 h-full overflow-hidden"
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    draggable={false}
                    className="w-full h-full object-cover select-none"
                    style={{
                      transform: isCenter
                        ? `translateX(${parallax}px) scale(1.05)`
                        : "scale(1.05)",
                      transition: isSettling
                        ? "transform 280ms cubic-bezier(.16,1,.3,1)"
                        : "none",
                    }}
                  />

                  {/* Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {isCenter && (
                    <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 lg:px-16">
                      <h2 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white mb-2 lg:mb-4 drop-shadow-lg tracking-tight">
                        {slide.title}
                      </h2>
                      <p className="text-green-400 text-sm sm:text-xl lg:text-2xl font-medium drop-shadow-lg max-w-xl">
                        {slide.subtitle}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Navigation Arrows */}
          {len > 1 && (
            <>
              <button
                onClick={() => { prev(); pauseTemporarily(); }}
                className="hidden lg:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full items-center justify-center transition-all duration-300 group border border-white/20"
              >
                <ChevronLeft className="w-7 h-7 text-white group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => { next(); pauseTemporarily(); }}
                className="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full items-center justify-center transition-all duration-300 group border border-white/20"
              >
                <ChevronRight className="w-7 h-7 text-white group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          )}

          {/* Dots Navigation */}
          {len > 1 && (
            <div className="absolute bottom-4 lg:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 lg:gap-3">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    go(i);
                    pauseTemporarily();
                  }}
                  className={`relative overflow-hidden rounded-full transition-all duration-300 ${
                    i === index
                      ? "w-8 lg:w-12 h-2 lg:h-2.5"
                      : "w-2 lg:w-2.5 h-2 lg:h-2.5 opacity-60 hover:opacity-100"
                  }`}
                >
                  {i === index ? (
                    <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400 rounded-full">
                      <span className="absolute inset-0 -translate-x-full animate-[shimmer_2s_linear_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                    </span>
                  ) : (
                    <span className="absolute inset-0 bg-white/80 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          )}

          <style>{`
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(200%); }
            }
          `}</style>
        </div>
      </div>
    </section>
  );
};

export default Hero;