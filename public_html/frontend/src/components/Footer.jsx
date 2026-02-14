import React, { useState } from "react";
import AboutModal from "./AboutModal";
import { useSettings } from "../context/SettingsContext";
import { Leaf, ArrowRight } from "lucide-react";

const Footer = () => {
  const { settings } = useSettings();
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const year = 2026;
  const siteName = settings?.siteName || "PlatanSad";

  const footerBg =
    "https://st3.depositphotos.com/15813770/36559/i/380/depositphotos_365591976-stock-photo-green-seedlings-sprouts-growing-soil.jpg";

  return (
    <>
      {/* ---------- FOOTER ---------- */}
      <footer
        className="relative text-white overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,.10), rgba(0,0,0,.34)), url("${footerBg}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* легкий градієнт для читабельності */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/30 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-3">
          <div className="py-5 sm:py-7 text-center">
            {/* Phones (green numbers) */}
            <div className="flex justify-center flex-wrap gap-4 sm:gap-6">
              <a
                href={`tel:${(settings?.phone1 || "+380636507449").replace(/\s/g, "")}`}
                className="text-[13px] sm:text-sm font-extrabold tracking-wide text-green-200 hover:text-green-100 transition drop-shadow"
              >
                {settings?.phone1 || "+380 (63) 650-74-49"}
              </a>

              <a
                href={`tel:${(settings?.phone2 || "+380952510347").replace(/\s/g, "")}`}
                className="text-[13px] sm:text-sm font-extrabold tracking-wide text-green-200 hover:text-green-100 transition drop-shadow"
              >
                {settings?.phone2 || "+380 (95) 251-03-47"}
              </a>
            </div>

            {/* About (modern CTA button) */}
            <div className="mt-5 flex justify-center">
              <button
                onClick={() => setIsAboutOpen(true)}
                data-testid="footer-about-btn"
                className="
                  group relative inline-flex items-center gap-3
                  px-6 py-3 sm:px-8 sm:py-3.5
                  bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500
                  hover:from-emerald-400 hover:via-green-400 hover:to-teal-400
                  rounded-full
                  text-white font-bold text-sm sm:text-base
                  shadow-lg shadow-emerald-500/30
                  hover:shadow-xl hover:shadow-emerald-500/40
                  transform hover:scale-105 hover:-translate-y-0.5
                  transition-all duration-300 ease-out
                  focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-black/50
                "
              >
                {/* Animated background glow */}
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
                
                {/* Icon container */}
                <span className="relative flex items-center justify-center w-8 h-8 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors duration-300">
                  <Leaf className="w-4 h-4 text-white" />
                </span>
                
                {/* Text */}
                <span className="relative">Про розсадник</span>
                
                {/* Arrow icon */}
                <ArrowRight className="relative w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>

            {/* Divider */}
            <div className="mx-auto mt-5 h-px w-40 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            {/* Copyright */}
            <div className="mt-3 text-[11px] sm:text-xs text-white/80 font-medium">
              © {year} {siteName}. Усі права захищено.
            </div>
          </div>
        </div>
      </footer>

      {/* ---------- ABOUT MODAL ---------- */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
};

export default Footer;
