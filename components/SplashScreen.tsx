"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function SplashScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detectar si es dispositivo móvil
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

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

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-primary transition-opacity duration-500"
      style={{
        opacity: isLoading ? 1 : 0,
        pointerEvents: isLoading ? "auto" : "none",
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse">
          <Image
            src="/assets/logo_web.png"
            alt="Mercadito"
            width={120}
            height={120}
            priority
          />
        </div>
        <div className="flex gap-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.3s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.15s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
}
