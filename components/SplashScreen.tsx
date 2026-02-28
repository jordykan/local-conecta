"use client";

import { useEffect, useState } from "react";

import { useTheme } from "next-themes";

export function SplashScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Detectar si es dispositivo móvil
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Detectar si está corriendo como PWA instalada
    const checkStandalone = () => {
      const isPwa =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone;
      setIsStandalone(!!isPwa);
    };

    checkMobile();
    checkStandalone();
    window.addEventListener("resize", checkMobile);

    // Ocultar el splash estático cuando React carga
    const staticSplash = document.getElementById("static-splash");
    if (staticSplash) {
      staticSplash.style.display = "none";
    }

    // Ocultar el splash después de que la app cargue
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // No mostrar en desktop
  if (!isMobile || !isLoading) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ${
        isDark ? "bg-black" : "bg-white"
      }`}
      style={{
        opacity: isLoading ? 1 : 0,
        pointerEvents: isLoading ? "auto" : "none",
      }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* We remove animate-pulse for PWA since the OS static splash image is not pulsing, creating a visual disconnect. We keep it pulsing for web. */}
        <div className={isStandalone ? "" : "animate-pulse"}>
          <img
            src="/assets/logo_web.png"
            alt="Mercadito"
            className="splash-logo"
          />
        </div>

        {/* Solo mostrar bolitas saltando en web móvil, no en PWA para una experiencia nativa más limpia */}
        {!isStandalone && (
          <div className="flex gap-1.5">
            <div
              className={`h-3 w-3 animate-bounce rounded-full [animation-delay:-0.3s] ${
                isDark ? "bg-white" : "bg-primary"
              }`}
            />
            <div
              className={`h-3 w-3 animate-bounce rounded-full [animation-delay:-0.15s] ${
                isDark ? "bg-white" : "bg-primary"
              }`}
            />
            <div
              className={`h-3 w-3 animate-bounce rounded-full ${
                isDark ? "bg-white" : "bg-primary"
              }`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
